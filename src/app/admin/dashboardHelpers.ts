'use client';

import { supabase } from '@/lib/supabase/client';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, format } from 'date-fns';

export interface DashboardMetrics {
  totalBookings: number;
  totalRevenue: number;
  activeProjects: number;
  pendingQuotes: number;
  monthlyStats: {
    bookings: number;
    revenue: number;
    completedProjects: number;
  };
  weeklyStats: {
    bookings: number;
    revenue: number;
    completedProjects: number;
  };
}

export interface RecentActivity {
  id: string;
  type: 'booking' | 'quote' | 'project' | 'payment';
  title: string;
  description: string;
  timestamp: string;
  status?: string;
  amount?: number;
}

export interface UpcomingTask {
  id: string;
  title: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  type: string;
  assignedTo?: {
    id: string;
    name: string;
  };
}

export async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  console.log('fetchDashboardMetrics called');
  
  // Test basic connectivity first
  const { data: testData, error: testError } = await supabase
    .from('user')
    .select('id')
    .limit(1);
    
  console.log('Test query result:', { testData, testError });
  
  if (testError) {
    console.error('Basic Supabase connection failed:', testError);
    throw new Error(`Database connection failed: ${testError.message}`);
  }
  
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const weekStart = startOfWeek(now);
  const weekEnd = endOfWeek(now);

  // Fetch total bookings
  const { count: totalBookings, error: bookingsError } = await supabase
    .from('booking')
    .select('*', { count: 'exact' });
    
  if (bookingsError) {
    console.error('Error fetching bookings:', bookingsError);
  }

  // Fetch active projects (bookings with status 'in_progress')
  const { count: activeProjects } = await supabase
    .from('booking')
    .select('*', { count: 'exact' })
    .eq('status', 'in_progress');

  // Fetch pending quotes
  const { count: pendingQuotes } = await supabase
    .from('quotes')
    .select('*', { count: 'exact' })
    .eq('status', 'sent');

  // Fetch monthly bookings
  const { count: monthlyBookings } = await supabase
    .from('booking')
    .select('*', { count: 'exact' })
    .gte('created_at', monthStart.toISOString())
    .lte('created_at', monthEnd.toISOString());

  // Fetch weekly bookings
  const { count: weeklyBookings } = await supabase
    .from('booking')
    .select('*', { count: 'exact' })
    .gte('created_at', weekStart.toISOString())
    .lte('created_at', weekEnd.toISOString());

  // Fetch revenue data
  const { data: payments } = await supabase
    .from('payment_transactions')
    .select('amount, transaction_date')
    .eq('transaction_status', 'completed');

  const totalRevenue = payments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;

  const monthlyRevenue = payments?.reduce((sum, payment) => {
    const paymentDate = new Date(payment.transaction_date);
    if (paymentDate >= monthStart && paymentDate <= monthEnd) {
      return sum + (payment.amount || 0);
    }
    return sum;
  }, 0) || 0;

  const weeklyRevenue = payments?.reduce((sum, payment) => {
    const paymentDate = new Date(payment.transaction_date);
    if (paymentDate >= weekStart && paymentDate <= weekEnd) {
      return sum + (payment.amount || 0);
    }
    return sum;
  }, 0) || 0;

  return {
    totalBookings: totalBookings || 0,
    totalRevenue,
    activeProjects: activeProjects || 0,
    pendingQuotes: pendingQuotes || 0,
    monthlyStats: {
      bookings: monthlyBookings || 0,
      revenue: monthlyRevenue,
      completedProjects: 0, // Add logic to calculate this
    },
    weeklyStats: {
      bookings: weeklyBookings || 0,
      revenue: weeklyRevenue,
      completedProjects: 0, // Add logic to calculate this
    },
  };
}

export async function fetchRecentActivity(): Promise<RecentActivity[]> {
  // Fetch recent bookings
  const { data: bookings } = await supabase
    .from('booking')
    .select(`
      id,
      created_at,
      customer_name,
      service_type,
      status
    `)
    .order('created_at', { ascending: false })
    .limit(5);

  // Fetch recent quotes
  const { data: quotes } = await supabase
    .from('quotes')
    .select(`
      id,
      created_at,
      customer_name,
      service_type,
      status,
      total_amount
    `)
    .order('created_at', { ascending: false })
    .limit(5);

  // Fetch recent payments
  const { data: payments } = await supabase
    .from('payment_transactions')
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
    .limit(5);

  const activities: RecentActivity[] = [
    ...(bookings?.map(booking => ({
      id: booking.id,
      type: 'booking' as const,
      title: `New Booking - ${booking.customer_name}`,
      description: `New ${booking.service_type} booking created`,
      timestamp: booking.created_at,
      status: booking.status,
    })) || []),
    ...(quotes?.map(quote => ({
      id: quote.id,
      type: 'quote' as const,
      title: `Quote for ${quote.customer_name}`,
      description: `${quote.service_type} quote ${quote.status}`,
      timestamp: quote.created_at,
      status: quote.status,
      amount: quote.total_amount,
    })) || []),
    ...(payments?.map(payment => ({
      id: payment.id,
      type: 'payment' as const,
      title: `Payment Received`,
      description: `Payment from ${payment.booking?.customer_name}`,
      timestamp: payment.transaction_date,
      status: payment.transaction_status,
      amount: payment.amount,
    })) || []),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
   .slice(0, 10);

  return activities;
}

export async function fetchUpcomingTasks(): Promise<UpcomingTask[]> {
  // Fetch upcoming project phases
  const { data: phases } = await supabase
    .from('project_phases')
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
    .limit(5);

  // Convert to UpcomingTask format
  return phases?.map(phase => ({
    id: phase.id,
    title: phase.phase_name,
    dueDate: phase.due_date,
    priority: determinePriority(phase.due_date),
    type: phase.booking?.service_type || 'Unknown',
    assignedTo: phase.assigned_user ? {
      id: phase.assigned_to,
      name: `${phase.assigned_user.firstName} ${phase.assigned_user.lastName}`,
    } : undefined,
  })) || [];
}

function determinePriority(dueDate: string): 'high' | 'medium' | 'low' {
  const days = Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 2) return 'high';
  if (days <= 7) return 'medium';
  return 'low';
}
