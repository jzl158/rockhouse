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
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json({ customers: [] });
    }

    const { data, error } = await supabaseAdmin
      .from('user')
      .select('id, firstName, lastName, email, phone, address')
      .eq('role', 'Customer')
      .or(`firstName.ilike.%${query}%,lastName.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(10);

    if (error) {
      console.error('Customer search error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    console.log('Found customers:', data);
    return NextResponse.json({ customers: data || [] });

  } catch (error) {
    console.error('Customer search API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}