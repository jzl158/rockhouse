import { supabase } from '@/lib/supabase/client';
import type { Tables } from "@/types/database.types";

export type Booking = Tables<"booking">;
export type Employee = Tables<"user">;

export async function fetchAvailableEmployees() {
  const { data, error } = await supabase
    .from('user')
    .select('*')
    .in('role', ['Employee', 'admin_assist'])
    .eq('is_active', true)
    .order('lastName', { ascending: true });

  if (error) throw error;
  return data;
}

export async function assignEmployee(bookingId: string, employeeId: string | null) {
  const { data, error } = await supabase
    .from('booking')
    .update({ 
      assigned_employee_id: employeeId,
      assignment_date: employeeId ? new Date().toISOString() : null,
      status: employeeId ? 'Assigned' : 'Confirmed'
    })
    .eq('id', bookingId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Helper function to create a job assignment when an employee is assigned
export async function createJobAssignment(bookingId: string, employeeId: string) {
  const { data: booking } = await supabase
    .from('booking')
    .select('preferred_date, customer_address')
    .eq('id', bookingId)
    .single();

  if (!booking?.preferred_date) {
    throw new Error('Booking must have a preferred date to create job assignment');
  }

  // Create a 2-hour job slot starting at 9 AM on the preferred date
  const startTime = new Date(booking.preferred_date);
  startTime.setHours(9, 0, 0, 0);
  
  const endTime = new Date(startTime);
  endTime.setHours(startTime.getHours() + 2);

  const { data, error } = await supabase
    .from('job_assignment')
    .insert({
      booking_id: bookingId,
      employee_id: employeeId,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      status: 'scheduled',
      job_address: booking.customer_address,
      assigned_date: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
