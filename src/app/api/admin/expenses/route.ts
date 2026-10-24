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
    const { data: expenses, error } = await supabaseAdmin
      .from('expenses')
      .select('*')
      .order('expense_date', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ expenses: expenses || [] });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      description, 
      category, 
      amount, 
      expenseDate, 
      vendor, 
      paymentMethod, 
      notes, 
      reimbursable 
    } = body;

    if (!description || !category || !amount || !expenseDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create expense
    const { data: expense, error: expenseError } = await supabaseAdmin
      .from('expenses')
      .insert({
        description,
        category,
        amount: parseFloat(amount),
        expense_date: expenseDate,
        vendor: vendor || null,
        payment_method: paymentMethod,
        notes: notes || null,
        reimbursable: reimbursable || false,
        status: 'pending',
        created_by: 'admin' // TODO: Get from authenticated user
      })
      .select()
      .single();

    if (expenseError) {
      throw expenseError;
    }

    return NextResponse.json({ expense });

  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 500 }
    );
  }
}