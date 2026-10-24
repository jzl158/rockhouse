import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/database.types';

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay?: boolean;
  extendedProps: {
    type: 'availability' | 'job' | 'booking' | 'unassigned';
    status?: string;
    employeeId?: string;
    bookingId?: string;
    description?: string;
  };
  backgroundColor?: string;
  borderColor?: string;
  classNames?: string[];
}

export async function fetchCalendarEvents(start: string, end: string) {
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch availability
  const { data: availability } = await supabase
    .from('availability')
    .select(`
      id,
      date,
      start_time,
      end_time,
      is_available,
      user_id,
      user:user_id (
        firstName,
        lastName
      )
    `)
    .gte('date', start)
    .lte('date', end);

  // Fetch job assignments
  const { data: jobs } = await supabase
    .from('job_assignment')
    .select(`
      id,
      booking_id,
      employee_id,
      start_time,
      end_time,
      status,
      employee:employee_id (
        firstName,
        lastName
      ),
      booking:booking_id (
        customer_name,
        service_type,
        customer_address
      )
    `)
    .or(`start_time.gte.${start},end_time.lte.${end}`);

  // Fetch unassigned bookings
  const { data: unassignedBookings } = await supabase
    .from('booking')
    .select(`
      id,
      customer_name,
      service_type,
      preferred_date,
      customer_address,
      status,
      service_details
    `)
    .is('assigned_employee_id', null) // Only get unassigned bookings
    .not('preferred_date', 'is', null) // Only get bookings with a preferred date
    .gte('preferred_date', start)
    .lte('preferred_date', end);

  // Transform availability into calendar events
  const availabilityEvents = (availability || []).map(avail => ({
    id: `availability-${avail.id}`,
    title: `${avail.user?.firstName} ${avail.user?.lastName} - ${avail.is_available ? 'Available' : 'Unavailable'}`,
    start: `${avail.date}T${avail.start_time}`,
    end: `${avail.date}T${avail.end_time}`,
    extendedProps: {
      type: 'availability' as const,
      employeeId: avail.user_id,
      description: avail.is_available ? 'Available' : 'Unavailable'
    },
    backgroundColor: avail.is_available ? '#4ade80' : '#f87171',
    borderColor: avail.is_available ? '#22c55e' : '#ef4444'
  }));

  // Transform jobs into calendar events
  const jobEvents = (jobs || []).map(job => ({
    id: `job-${job.id}`,
    title: `${job.booking?.customer_name} - ${job.booking?.service_type}`,
    start: job.start_time,
    end: job.end_time,
    extendedProps: {
      type: 'job' as const,
      employeeId: job.employee_id,
      bookingId: job.booking_id,
      status: job.status,
      description: `
        Assigned to: ${job.employee?.firstName} ${job.employee?.lastName}
        Address: ${job.booking?.customer_address || 'No address provided'}
      `
    },
    backgroundColor: '#60a5fa',
    borderColor: '#3b82f6'
  }));

  // Transform unassigned bookings into calendar events
  const unassignedEvents = (unassignedBookings || []).map(booking => {
    // Create a default end time 2 hours after the preferred date
    const startDate = new Date(booking.preferred_date);
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 2);

    return {
      id: `unassigned-${booking.id}`,
      title: `⚠️ Unassigned: ${booking.customer_name} - ${booking.service_type}`,
      start: booking.preferred_date,
      end: endDate.toISOString(),
      extendedProps: {
        type: 'unassigned' as const,
        bookingId: booking.id,
        status: booking.status,
        description: `
          Service: ${booking.service_type}
          Address: ${booking.customer_address || 'No address provided'}
          Details: ${booking.service_details || 'No additional details'}
          Status: ${booking.status || 'No status'}
        `
      },
      backgroundColor: '#fbbf24', // Amber color for unassigned bookings
      borderColor: '#f59e0b',
      classNames: ['unassigned-booking'], // Can be used for custom styling
    };
  });

  return [...availabilityEvents, ...jobEvents, ...unassignedEvents];
}

export async function fetchEmployees() {
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: employees } = await supabase
    .from('user')
    .select('id, firstName, lastName, role')
    .in('role', ['employee', 'admin_assist'])
    .eq('is_active', true);

  return employees || [];
}

export async function updateJobAssignment(
  jobId: string,
  updates: {
    start_time?: string;
    end_time?: string;
    employee_id?: string;
  }
) {
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from('job_assignment')
    .update(updates)
    .eq('id', jobId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateAvailability(
  availabilityId: string,
  updates: {
    date?: string;
    start_time?: string;
    end_time?: string;
    is_available?: boolean;
  }
) {
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from('availability')
    .update(updates)
    .eq('id', availabilityId)
    .select()
    .single();

  if (error) throw error;
  return data;
}