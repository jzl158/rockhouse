import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

// Create service role client for admin operations
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

interface RouteParams {
  params: {
    id: string;
  };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: bookingId } = params;
    const body = await request.json();
    const { 
      dueDate, 
      notes: additionalNotes,
      adjustments = [] // Array of { description, amount } for any adjustments
    } = body;

    console.log('Creating invoice from quote for booking:', { bookingId, body });

    // 1. Fetch the booking to get basic info
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('booking')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      console.error('Booking fetch error:', bookingError);
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // 2. Check if booking has an associated quote (from booking_id field in quotes)
    const { data: quote, error: quoteError } = await supabaseAdmin
      .from('quotes')
      .select(`
        *,
        quote_items (*)
      `)
      .eq('booking_id', bookingId)
      .single();

    let lineItems = [];
    let useQuoteData = false;

    if (quote && !quoteError) {
      // Use original quote line items
      useQuoteData = true;
      lineItems = quote.quote_items?.map((item: any) => ({
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        item_type: item.item_type || 'service',
        tax_rate: 0.08 // Default tax rate
      })) || [];

      console.log('Using quote data for invoice:', { quoteId: quote.id, lineItemsCount: lineItems.length });
    } else {
      // Fallback to booking service cost as single line item
      const serviceCost = booking.service_cost || booking.estimated_value || 0;
      lineItems = [{
        description: booking.service_type || 'Service',
        quantity: 1,
        unit_price: serviceCost,
        total_price: serviceCost,
        item_type: 'service',
        tax_rate: 0.08
      }];

      console.log('No quote found, using booking service cost:', serviceCost);
    }

    // 3. Add any adjustments as additional line items
    if (adjustments && adjustments.length > 0) {
      adjustments.forEach((adj: any) => {
        lineItems.push({
          description: adj.description,
          quantity: 1,
          unit_price: adj.amount,
          total_price: adj.amount,
          item_type: 'adjustment',
          tax_rate: 0.08
        });
      });
    }

    // 4. Calculate totals
    const subtotal = lineItems.reduce((total, item) => total + (item.total_price || 0), 0);
    const taxRate = 0.08;
    const taxAmount = subtotal * taxRate;
    const totalAmount = subtotal + taxAmount;

    // 5. Generate invoice number
    const invoiceNumber = await generateInvoiceNumber();

    // 6. Create the invoice
    const invoiceData = {
      booking_id: bookingId,
      invoice_number: invoiceNumber,
      issue_date: new Date().toISOString(),
      due_date: dueDate,
      subtotal,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      notes: useQuoteData ? 
        `Invoice based on Quote ${quote.reference_number}${additionalNotes ? `\n\n${additionalNotes}` : ''}` :
        `Invoice for booking ${booking.reference_number}${additionalNotes ? `\n\n${additionalNotes}` : ''}`,
      status: 'draft',
      created_by: 'admin', // TODO: Get from auth context
      created_at: new Date().toISOString()
    };

    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from('invoices')
      .insert(invoiceData)
      .select()
      .single();

    if (invoiceError) {
      console.error('Invoice creation error:', invoiceError);
      return NextResponse.json(
        { error: 'Failed to create invoice: ' + invoiceError.message },
        { status: 500 }
      );
    }

    // 7. Create line items
    const lineItemsToInsert = lineItems.map(item => ({
      invoice_id: invoice.id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
      item_type: item.item_type,
      tax_rate: item.tax_rate
    }));

    const { error: lineItemsError } = await supabaseAdmin
      .from('invoice_line_items')
      .insert(lineItemsToInsert);

    if (lineItemsError) {
      console.error('Line items creation error:', lineItemsError);
      // Cleanup - delete the invoice if line items failed
      await supabaseAdmin.from('invoices').delete().eq('id', invoice.id);
      return NextResponse.json(
        { error: 'Failed to create invoice line items' },
        { status: 500 }
      );
    }

    // 8. Fetch the complete invoice with line items for response
    const { data: completeInvoice } = await supabaseAdmin
      .from('invoices')
      .select(`
        *,
        invoice_line_items (*),
        booking:booking_id (
          customer_name,
          customer_email,
          reference_number
        )
      `)
      .eq('id', invoice.id)
      .single();

    console.log('Invoice creation completed successfully');

    return NextResponse.json({
      success: true,
      message: useQuoteData ? 
        `Invoice created from original quote ${quote.reference_number}` :
        `Invoice created from booking ${booking.reference_number}`,
      invoice: completeInvoice,
      source: useQuoteData ? 'quote' : 'booking',
      quote_reference: useQuoteData ? quote.reference_number : null
    });

  } catch (error) {
    console.error('Error in booking-to-invoice from quote conversion:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to generate invoice number
async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  
  // Get the latest invoice number for this year/month
  const { data: latestInvoice } = await supabaseAdmin
    .from('invoices')
    .select('invoice_number')
    .like('invoice_number', `INV-${year}${month}%`)
    .order('created_at', { ascending: false })
    .limit(1);

  let sequence = 1;
  if (latestInvoice && latestInvoice.length > 0) {
    const lastNumber = latestInvoice[0].invoice_number;
    const lastSequence = parseInt(lastNumber.split('-')[2] || '0');
    sequence = lastSequence + 1;
  }

  return `INV-${year}${month}-${String(sequence).padStart(4, '0')}`;
}