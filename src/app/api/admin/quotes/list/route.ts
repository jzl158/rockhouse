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
    const { data: quotes, error } = await supabaseAdmin
      .from('quotes')
      .select(`
        id,
        customer_name,
        customer_email,
        service_type,
        total_amount,
        status,
        reference_number,
        created_at,
        valid_until,
        booking_id,
        quote_items (
          id,
          description,
          quantity,
          unit_price,
          total_price
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching quotes:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Enhance quotes with booking and invoice status
    const enhancedQuotes = await Promise.all(
      (quotes || []).map(async (quote) => {
        let bookingStatus = null;
        let invoiceStatus = null;

        if (quote.booking_id) {
          // Get booking info
          const { data: booking } = await supabaseAdmin
            .from('booking')
            .select('id, reference_number, status')
            .eq('id', quote.booking_id)
            .single();

          if (booking) {
            bookingStatus = {
              id: booking.id,
              reference: booking.reference_number,
              status: booking.status
            };

            // Check for related invoice
            const { data: invoices } = await supabaseAdmin
              .from('invoices')
              .select('id, invoice_number, status')
              .eq('booking_id', booking.id)
              .limit(1);

            if (invoices && invoices.length > 0) {
              invoiceStatus = {
                id: invoices[0].id,
                reference: invoices[0].invoice_number,
                status: invoices[0].status
              };
            }
          }
        }

        return {
          ...quote,
          workflow_status: {
            booking: bookingStatus,
            invoice: invoiceStatus
          }
        };
      })
    );

    return NextResponse.json({ quotes: enhancedQuotes });

  } catch (error) {
    console.error('Admin quotes list API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}