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
    const forInvoice = searchParams.get('for_invoice') === 'true';
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let query = supabaseAdmin
      .from('booking')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);

    // If this is for invoice creation, only get bookings that don't have invoices yet
    // or have completed status
    if (forInvoice) {
      query = query.in('status', ['Completed', 'Confirmed']);
    }

    // Filter by status if provided
    if (status) {
      query = query.eq('status', status);
    }

    // Search in customer name, email, and service type
    if (search) {
      query = query.or(
        `customer_name.ilike.%${search}%,customer_email.ilike.%${search}%,service_type.ilike.%${search}%`
      );
    }

    const { data: bookings, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({ bookings: bookings || [] });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}