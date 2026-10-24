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
    const { id: quoteId } = params;
    const body = await request.json();
    const { 
      preferred_date, 
      assignment_date, 
      assigned_employee_id,
      notes: additionalNotes 
    } = body;

    console.log('Converting quote to booking:', { quoteId, body });

    // 1. Fetch the complete quote with line items
    const { data: quote, error: quoteError } = await supabaseAdmin
      .from('quotes')
      .select(`
        *,
        quote_items (*)
      `)
      .eq('id', quoteId)
      .single();

    if (quoteError || !quote) {
      console.error('Quote fetch error:', quoteError);
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    // Check if quote is in acceptable status
    if (quote.status === 'accepted') {
      return NextResponse.json(
        { error: 'Quote has already been accepted' },
        { status: 400 }
      );
    }

    if (quote.status === 'rejected' || quote.status === 'expired') {
      return NextResponse.json(
        { error: 'Cannot accept a rejected or expired quote' },
        { status: 400 }
      );
    }

    // 2. Generate booking reference number
    const bookingReference = await generateBookingReference();

    // 3. Calculate service cost from quote items
    const serviceCost = quote.quote_items?.reduce((total, item) => 
      total + (item.total_price || 0), 0) || quote.total_amount || 0;

    // 4. Create the booking from quote data
    const bookingData = {
      reference_number: bookingReference,
      customer_name: quote.customer_name,
      customer_email: quote.customer_email,
      customer_phone: quote.customer_phone,
      customer_address: quote.customer_address,
      service_type: quote.service_type,
      service_details: quote.service_description || '',
      preferred_date: preferred_date || null,
      status: 'Confirmed',
      estimated_value: quote.total_amount,
      service_cost: serviceCost,
      amount_due: serviceCost,
      amount_paid: 0,
      payment_status: 'pending',
      notes: additionalNotes ? 
        `Created from Quote ${quote.reference_number}.\n\n${additionalNotes}` :
        `Created from Quote ${quote.reference_number}`,
      assignment_date: assignment_date || null,
      assigned_employee_id: assigned_employee_id || null,
      user_id: quote.customer_id, // Link to customer if available
      created_at: new Date().toISOString()
    };

    console.log('Creating booking with data:', bookingData);

    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('booking')
      .insert(bookingData)
      .select()
      .single();

    if (bookingError) {
      console.error('Booking creation error:', bookingError);
      return NextResponse.json(
        { error: 'Failed to create booking: ' + bookingError.message },
        { status: 500 }
      );
    }

    // 5. Update quote status to accepted and link to booking
    const { error: updateQuoteError } = await supabaseAdmin
      .from('quotes')
      .update({
        status: 'accepted',
        booking_id: booking.id
      })
      .eq('id', quoteId);

    if (updateQuoteError) {
      console.error('Quote update error:', updateQuoteError);
      // Try to cleanup the booking if quote update failed
      await supabaseAdmin.from('booking').delete().eq('id', booking.id);
      return NextResponse.json(
        { error: 'Failed to update quote status' },
        { status: 500 }
      );
    }

    // 6. Create project documents/notes based on quote items for reference
    const itemsSummary = quote.quote_items?.map(item => 
      `${item.description}: ${item.quantity} x $${item.unit_price} = $${item.total_price}`
    ).join('\n') || '';

    if (itemsSummary) {
      await supabaseAdmin
        .from('project_documents')
        .insert({
          booking_id: booking.id,
          title: `Quote Items Reference - ${quote.reference_number}`,
          document_type: 'quote_reference',
          notes: `Original quote items:\n\n${itemsSummary}\n\nQuote Total: $${quote.total_amount}`,
          created_at: new Date().toISOString()
        });
    }

    console.log('Quote conversion completed successfully');

    return NextResponse.json({
      success: true,
      message: 'Quote successfully converted to booking',
      booking: {
        ...booking,
        quote_reference: quote.reference_number
      },
      quote: {
        id: quote.id,
        reference_number: quote.reference_number,
        status: 'accepted'
      }
    });

  } catch (error) {
    console.error('Error in quote-to-booking conversion:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to generate booking reference number
async function generateBookingReference(): Promise<string> {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  
  // Get the latest booking number for this year/month
  const { data: latestBooking } = await supabaseAdmin
    .from('booking')
    .select('reference_number')
    .like('reference_number', `BK-${year}${month}%`)
    .order('created_at', { ascending: false })
    .limit(1);

  let sequence = 1;
  if (latestBooking && latestBooking.length > 0) {
    const lastNumber = latestBooking[0].reference_number;
    const lastSequence = parseInt(lastNumber.split('-')[2] || '0');
    sequence = lastSequence + 1;
  }

  return `BK-${year}${month}-${String(sequence).padStart(4, '0')}`;
}