import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

// Use service role client to bypass RLS
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const customerId = searchParams.get('customer_id');
    const bookingId = searchParams.get('booking_id');

    let query = supabaseAdmin
      .from('invoices')
      .select(`
        *,
        booking:booking_id (
          customer_name,
          customer_email,
          customer_phone,
          customer_address,
          service_type,
          reference_number
        ),
        invoice_line_items (
          id,
          description,
          quantity,
          unit_price,
          total_price,
          item_type,
          tax_rate
        )
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (customerId) {
      query = query.eq('booking.customer_id', customerId);
    }
    if (bookingId) {
      query = query.eq('booking_id', bookingId);
    }

    const { data: invoices, error } = await query;

    if (error) {
      console.error('Database error fetching invoices:', error);
      return NextResponse.json(
        { error: 'Failed to fetch invoices' },
        { status: 500 }
      );
    }

    // Transform data to include customer info directly
    const formattedInvoices = (invoices || []).map(invoice => ({
      ...invoice,
      customerName: invoice.booking?.customer_name,
      customerEmail: invoice.booking?.customer_email,
      customerPhone: invoice.booking?.customer_phone,
      customerAddress: invoice.booking?.customer_address,
      serviceType: invoice.booking?.service_type,
      bookingReference: invoice.booking?.reference_number
    }));

    return NextResponse.json({ 
      invoices: formattedInvoices,
      count: formattedInvoices.length 
    });
  } catch (error) {
    console.error('Error in GET /api/admin/invoices:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== Invoice Creation Started ===');
    const body = await request.json();
    console.log('Request body:', JSON.stringify(body, null, 2));
    
    const { bookingId, dueDate, notes, lineItems } = body;

    if (!bookingId || !dueDate || !lineItems || lineItems.length === 0) {
      console.log('Missing required fields:', { bookingId, dueDate, lineItemsLength: lineItems?.length });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get booking details
    console.log('Looking up booking with ID:', bookingId);
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('booking')
      .select('customer_name, customer_email')
      .eq('id', bookingId)
      .single();

    console.log('Booking lookup result:', { booking, bookingError });

    if (bookingError || !booking) {
      console.log('Booking not found or error:', bookingError);
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 400 }
      );
    }

    // Calculate totals
    console.log('Calculating totals for line items:', lineItems);
    const subtotal = lineItems.reduce((sum: number, item: any) => sum + item.total, 0);
    const taxRate = 0.08; // 8% tax
    const taxAmount = subtotal * taxRate;
    const totalAmount = subtotal + taxAmount;
    console.log('Calculated amounts:', { subtotal, taxAmount, totalAmount });

    // Generate invoice number
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    console.log('Generating invoice number for date:', { year, month });
    
    // Get count of invoices this month to generate sequential number
    const nextMonth = month === '12' ? '01' : String(parseInt(month) + 1).padStart(2, '0');
    const nextYear = month === '12' ? year + 1 : year;
    
    console.log('Querying invoice count with date range:', {
      from: `${year}-${month}-01`,
      to: `${nextYear}-${nextMonth}-01`
    });
    
    const { count, error: countError } = await supabaseAdmin
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', `${year}-${month}-01`)
      .lt('created_at', `${nextYear}-${nextMonth}-01`);

    console.log('Invoice count query result:', { count, countError });

    if (countError) {
      console.log('Error getting invoice count:', countError);
      throw countError;
    }

    const invoiceNumber = `INV-${year}-${String((count || 0) + 1).padStart(3, '0')}`;
    console.log('Generated invoice number:', invoiceNumber);

    // Create invoice
    const invoiceData = {
      booking_id: bookingId,
      invoice_number: invoiceNumber,
      issue_date: new Date().toISOString().split('T')[0],
      due_date: dueDate,
      subtotal,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      notes,
      status: 'draft',
      created_by: 'admin' // TODO: Get from authenticated user
    };
    
    console.log('Creating invoice with data:', invoiceData);
    
    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from('invoices')
      .insert(invoiceData)
      .select()
      .single();

    console.log('Invoice creation result:', { invoice, invoiceError });

    if (invoiceError) {
      console.log('Error creating invoice:', invoiceError);
      throw invoiceError;
    }

    // Create line items
    const lineItemsWithInvoiceId = lineItems.map((item: any) => ({
      invoice_id: invoice.id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unitPrice || item.unit_price, // Handle both camelCase and snake_case
      total_price: item.total,
      tax_rate: taxRate
    }));

    console.log('Creating line items:', lineItemsWithInvoiceId);

    const { error: lineItemsError } = await supabaseAdmin
      .from('invoice_line_items')
      .insert(lineItemsWithInvoiceId);

    console.log('Line items creation result:', { lineItemsError });

    if (lineItemsError) {
      console.log('Error creating line items, rolling back invoice:', lineItemsError);
      // Rollback: delete the invoice if line items failed
      await supabaseAdmin.from('invoices').delete().eq('id', invoice.id);
      throw lineItemsError;
    }

    console.log('Invoice creation completed successfully');
    return NextResponse.json({ 
      invoice: {
        ...invoice,
        customerName: booking.customer_name
      }
    });

  } catch (error) {
    console.error('=== Invoice Creation Failed ===');
    console.error('Error details:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { invoiceId, status, notes } = body;

    if (!invoiceId) {
      return NextResponse.json(
        { error: 'Invoice ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    // If marking as paid, record the payment transaction
    if (status === 'paid') {
      // Get invoice details first
      const { data: invoice } = await supabaseAdmin
        .from('invoices')
        .select('total_amount, booking_id')
        .eq('id', invoiceId)
        .single();

      if (invoice) {
        // Create payment transaction record
        await supabaseAdmin
          .from('payment_transactions')
          .insert({
            amount: invoice.total_amount,
            booking_id: invoice.booking_id,
            invoice_id: invoiceId,
            payment_method: 'manual', // Default for admin marking as paid
            transaction_date: new Date().toISOString(),
            transaction_status: 'completed',
            created_by: 'admin', // TODO: Get from auth context
            notes: 'Marked as paid by admin'
          });
      }
    }

    const { data: updatedInvoice, error } = await supabaseAdmin
      .from('invoices')
      .update(updateData)
      .eq('id', invoiceId)
      .select(`
        *,
        booking:booking_id (
          customer_name,
          customer_email,
          customer_phone,
          customer_address,
          service_type,
          reference_number
        ),
        invoice_line_items (*)
      `)
      .single();

    if (error) {
      console.error('Error updating invoice:', error);
      return NextResponse.json(
        { error: 'Failed to update invoice' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      invoice: {
        ...updatedInvoice,
        customerName: updatedInvoice.booking?.customer_name,
        customerEmail: updatedInvoice.booking?.customer_email
      }
    });

  } catch (error) {
    console.error('Error in PATCH /api/admin/invoices:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}