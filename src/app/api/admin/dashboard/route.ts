import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';

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
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);

    // Execute all queries in parallel for better performance
    const [
      totalBookingsResult,
      activeProjectsResult,
      pendingQuotesResult,
      monthlyBookingsResult,
      weeklyBookingsResult,
      paymentsResult,
      recentBookingsResult,
      recentQuotesResult,
      recentPaymentsResult,
      upcomingPhasesResult
    ] = await Promise.allSettled([
      // Metrics queries
      supabaseAdmin.from('booking').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('booking').select('*', { count: 'exact', head: true }).eq('status', 'in_progress'),
      supabaseAdmin.from('quotes').select('*', { count: 'exact', head: true }).eq('status', 'sent'),
      supabaseAdmin.from('booking').select('*', { count: 'exact', head: true })
        .gte('created_at', monthStart.toISOString())
        .lte('created_at', monthEnd.toISOString()),
      supabaseAdmin.from('booking').select('*', { count: 'exact', head: true })
        .gte('created_at', weekStart.toISOString())
        .lte('created_at', weekEnd.toISOString()),
      supabaseAdmin.from('payment_transactions')
        .select('amount, transaction_date')
        .eq('transaction_status', 'completed'),
      
      // Recent activity queries
      supabaseAdmin.from('booking')
        .select('id, created_at, customer_name, service_type, status')
        .order('created_at', { ascending: false })
        .limit(5),
      supabaseAdmin.from('quotes')
        .select('id, created_at, customer_name, service_type, status, total_amount')
        .order('created_at', { ascending: false })
        .limit(5),
      supabaseAdmin.from('payment_transactions')
        .select(`
          id,
          transaction_date,
          amount,
          transaction_status,
          booking_id,
          booking:booking_id (
            customer_name
          )
        `)
        .order('transaction_date', { ascending: false })
        .limit(5),
      
      // Upcoming tasks query
      supabaseAdmin.from('project_phases')
        .select(`
          id,
          phase_name,
          due_date,
          booking_id,
          assigned_to,
          booking:booking_id (
            service_type
          ),
          assigned_user:assigned_to (
            firstName,
            lastName
          )
        `)
        .gt('due_date', new Date().toISOString())
        .order('due_date')
        .limit(5)
    ]);

    // Extract data from settled promises, handling errors gracefully
    const totalBookings = totalBookingsResult.status === 'fulfilled' ? totalBookingsResult.value.count || 0 : 0;
    const activeProjects = activeProjectsResult.status === 'fulfilled' ? activeProjectsResult.value.count || 0 : 0;
    const pendingQuotes = pendingQuotesResult.status === 'fulfilled' ? pendingQuotesResult.value.count || 0 : 0;
    const monthlyBookings = monthlyBookingsResult.status === 'fulfilled' ? monthlyBookingsResult.value.count || 0 : 0;
    const weeklyBookings = weeklyBookingsResult.status === 'fulfilled' ? weeklyBookingsResult.value.count || 0 : 0;
    
    const payments = paymentsResult.status === 'fulfilled' ? paymentsResult.value.data || [] : [];
    const totalRevenue = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    
    const monthlyRevenue = payments.reduce((sum, payment) => {
      const paymentDate = new Date(payment.transaction_date);
      if (paymentDate >= monthStart && paymentDate <= monthEnd) {
        return sum + (payment.amount || 0);
      }
      return sum;
    }, 0);

    const weeklyRevenue = payments.reduce((sum, payment) => {
      const paymentDate = new Date(payment.transaction_date);
      if (paymentDate >= weekStart && paymentDate <= weekEnd) {
        return sum + (payment.amount || 0);
      }
      return sum;
    }, 0);

    // Build metrics object
    const metrics = {
      totalBookings,
      totalRevenue,
      activeProjects,
      pendingQuotes,
      monthlyStats: {
        bookings: monthlyBookings,
        revenue: monthlyRevenue,
        completedProjects: 0, // TODO: Add logic if needed
      },
      weeklyStats: {
        bookings: weeklyBookings,
        revenue: weeklyRevenue,
        completedProjects: 0, // TODO: Add logic if needed
      },
    };

    // Build recent activities
    const recentBookings = recentBookingsResult.status === 'fulfilled' ? recentBookingsResult.value.data || [] : [];
    const recentQuotes = recentQuotesResult.status === 'fulfilled' ? recentQuotesResult.value.data || [] : [];
    const recentPayments = recentPaymentsResult.status === 'fulfilled' ? recentPaymentsResult.value.data || [] : [];

    const activities = [
      ...recentBookings.map(booking => ({
        id: booking.id,
        type: 'booking' as const,
        title: `New Booking - ${booking.customer_name}`,
        description: `New ${booking.service_type} booking created`,
        timestamp: booking.created_at,
        status: booking.status,
      })),
      ...recentQuotes.map(quote => ({
        id: quote.id,
        type: 'quote' as const,
        title: `Quote for ${quote.customer_name}`,
        description: `${quote.service_type} quote ${quote.status}`,
        timestamp: quote.created_at,
        status: quote.status,
        amount: quote.total_amount,
      })),
      ...recentPayments.map(payment => ({
        id: payment.id,
        type: 'payment' as const,
        title: `Payment Received`,
        description: `Payment from ${payment.booking?.customer_name || 'Unknown'}`,
        timestamp: payment.transaction_date,
        status: payment.transaction_status,
        amount: payment.amount,
      })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
     .slice(0, 10);

    // Build upcoming tasks
    const upcomingPhases = upcomingPhasesResult.status === 'fulfilled' ? upcomingPhasesResult.value.data || [] : [];
    const tasks = upcomingPhases.map(phase => ({
      id: phase.id,
      title: phase.phase_name,
      dueDate: phase.due_date,
      priority: determinePriority(phase.due_date),
      type: phase.booking?.service_type || 'Unknown',
      assignedTo: phase.assigned_user ? {
        id: phase.assigned_to,
        name: `${phase.assigned_user.firstName} ${phase.assigned_user.lastName}`,
      } : undefined,
    }));

    return NextResponse.json({
      metrics,
      activities,
      tasks
    });

  } catch (error) {
    console.error('Admin dashboard API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function determinePriority(dueDate: string): 'high' | 'medium' | 'low' {
  const days = Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 2) return 'high';
  if (days <= 7) return 'medium';
  return 'low';
}