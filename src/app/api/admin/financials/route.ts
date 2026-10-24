import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import { startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

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
    const action = searchParams.get('action') || 'metrics';

    if (action === 'metrics') {
      return getFinancialMetrics();
    } else if (action === 'transactions') {
      return getRecentTransactions();
    } else if (action === 'outstanding') {
      return getOutstandingInvoices();
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Financials API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getFinancialMetrics() {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const yearStart = startOfYear(now);
  const yearEnd = endOfYear(now);

  try {
    // Execute all queries in parallel
    const [
      paymentsResult,
      expensesResult,
      invoicesResult,
      monthlyPaymentsResult,
      monthlyExpensesResult
    ] = await Promise.allSettled([
      // Total payments (completed)
      supabaseAdmin.from('payment_transactions')
        .select('amount')
        .eq('transaction_status', 'completed'),
      
      // Total expenses (approved)
      supabaseAdmin.from('expenses')
        .select('amount')
        .eq('status', 'approved'),
      
      // Outstanding invoices
      supabaseAdmin.from('invoices')
        .select('total_amount, status')
        .in('status', ['draft', 'sent', 'overdue']),
      
      // Monthly payments
      supabaseAdmin.from('payment_transactions')
        .select('amount')
        .eq('transaction_status', 'completed')
        .gte('transaction_date', monthStart.toISOString())
        .lte('transaction_date', monthEnd.toISOString()),
      
      // Monthly expenses
      supabaseAdmin.from('expenses')
        .select('amount')
        .eq('status', 'approved')
        .gte('expense_date', monthStart.toISOString())
        .lte('expense_date', monthEnd.toISOString())
    ]);

    // Calculate totals
    const payments = paymentsResult.status === 'fulfilled' ? paymentsResult.value.data || [] : [];
    const expenses = expensesResult.status === 'fulfilled' ? expensesResult.value.data || [] : [];
    const invoices = invoicesResult.status === 'fulfilled' ? invoicesResult.value.data || [] : [];
    const monthlyPayments = monthlyPaymentsResult.status === 'fulfilled' ? monthlyPaymentsResult.value.data || [] : [];
    const monthlyExpenses = monthlyExpensesResult.status === 'fulfilled' ? monthlyExpensesResult.value.data || [] : [];

    const totalRevenue = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
    const outstandingInvoices = invoices.reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0);
    const monthlyRevenue = monthlyPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const monthlyExpensesTotal = monthlyExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);

    const metrics = {
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      outstandingInvoices,
      pendingPayments: 0, // Will calculate from pending payment transactions
      monthlyRevenue,
      monthlyExpenses: monthlyExpensesTotal,
      cashFlow: monthlyRevenue - monthlyExpensesTotal
    };

    return NextResponse.json({ metrics });
  } catch (error) {
    console.error('Error fetching financial metrics:', error);
    return NextResponse.json({ error: 'Failed to fetch financial metrics' }, { status: 500 });
  }
}

async function getRecentTransactions() {
  try {
    // Get recent payments
    const { data: payments } = await supabaseAdmin
      .from('payment_transactions')
      .select(`
        id,
        amount,
        transaction_date,
        transaction_status,
        payment_method,
        notes,
        booking:booking_id (
          customer_name
        )
      `)
      .order('transaction_date', { ascending: false })
      .limit(5);

    // Get recent expenses
    const { data: expenses } = await supabaseAdmin
      .from('expenses')
      .select(`
        id,
        amount,
        expense_date,
        status,
        description,
        category
      `)
      .order('expense_date', { ascending: false })
      .limit(5);

    // Get recent invoices
    const { data: invoices } = await supabaseAdmin
      .from('invoices')
      .select(`
        id,
        total_amount,
        created_at,
        status,
        invoice_number,
        booking:booking_id (
          customer_name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    // Combine and format transactions
    const transactions = [
      ...(payments || []).map(payment => ({
        id: payment.id,
        type: 'payment' as const,
        amount: payment.amount,
        description: `Payment from ${payment.booking?.customer_name || 'Unknown'}`,
        date: payment.transaction_date,
        status: payment.transaction_status,
        customer: payment.booking?.customer_name
      })),
      ...(expenses || []).map(expense => ({
        id: expense.id,
        type: 'expense' as const,
        amount: expense.amount,
        description: expense.description,
        date: expense.expense_date,
        status: expense.status
      })),
      ...(invoices || []).map(invoice => ({
        id: invoice.id,
        type: 'invoice' as const,
        amount: invoice.total_amount,
        description: `Invoice ${invoice.invoice_number} - ${invoice.booking?.customer_name || 'Unknown'}`,
        date: invoice.created_at,
        status: invoice.status,
        customer: invoice.booking?.customer_name
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
     .slice(0, 10);

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error('Error fetching recent transactions:', error);
    return NextResponse.json({ error: 'Failed to fetch recent transactions' }, { status: 500 });
  }
}

async function getOutstandingInvoices() {
  try {
    const { data: invoices } = await supabaseAdmin
      .from('invoices')
      .select(`
        id,
        invoice_number,
        total_amount,
        due_date,
        status,
        booking:booking_id (
          customer_name
        )
      `)
      .in('status', ['draft', 'sent', 'overdue'])
      .order('due_date', { ascending: true });

    const outstandingInvoices = (invoices || []).map(invoice => {
      const dueDate = new Date(invoice.due_date);
      const today = new Date();
      const daysOverdue = dueDate < today ? Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)) : undefined;

      return {
        id: invoice.id,
        invoiceNumber: invoice.invoice_number,
        customerName: invoice.booking?.customer_name || 'Unknown',
        amount: invoice.total_amount,
        dueDate: invoice.due_date,
        status: daysOverdue ? 'overdue' : invoice.status,
        daysOverdue
      };
    });

    return NextResponse.json({ outstandingInvoices });
  } catch (error) {
    console.error('Error fetching outstanding invoices:', error);
    return NextResponse.json({ error: 'Failed to fetch outstanding invoices' }, { status: 500 });
  }
}