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
    const { data: payments, error } = await supabaseAdmin
      .from('payment_transactions')
      .select(`
        *,
        booking:booking_id (
          customer_name,
          customer_email
        ),
        invoice:invoice_id (
          invoice_number
        )
      `)
      .order('transaction_date', { ascending: false });

    if (error) {
      throw error;
    }

    // Format the response to include customer name
    const formattedPayments = (payments || []).map(payment => ({
      ...payment,
      customerName: payment.booking?.customer_name
    }));

    return NextResponse.json({ payments: formattedPayments });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      bookingId, 
      invoiceId, 
      amount, 
      paymentMethod, 
      transactionDate, 
      transactionReference, 
      notes 
    } = body;

    if (!amount || !paymentMethod || !transactionDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create payment transaction
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('payment_transactions')
      .insert({
        booking_id: bookingId || null,
        invoice_id: invoiceId || null,
        amount: parseFloat(amount),
        payment_method: paymentMethod,
        transaction_date: transactionDate,
        transaction_reference: transactionReference || null,
        notes: notes || null,
        transaction_status: 'completed', // Manual payments are marked as completed by default
        created_by: 'admin' // TODO: Get from authenticated user
      })
      .select()
      .single();

    if (paymentError) {
      throw paymentError;
    }

    return NextResponse.json({ payment });

  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: 'Failed to record payment' },
      { status: 500 }
    );
  }
}