import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/database.types';

export interface TeamMember {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  phone: string | null;
  role: string | null;
  position: string | null;
  hire_date: string | null;
  is_active: boolean | null;
  is_admin: boolean | null;
  specialties: any | null;
  address: string | null;
}

export async function fetchTeamMembers() {
  console.log('Starting fetchTeamMembers...');
  
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  console.log('Supabase client created');

  try {
    console.log('Executing query...');
    const { data, error } = await supabase
      .from('user')
      .select('*')
      .eq('role', 'Employee')
      .order('lastName', { ascending: true });

    console.log('Query completed');
    console.log('Data received:', data);
    
    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.log('No team members found');
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchTeamMembers:', error);
    throw error;
  }
}

export async function createTeamMember(memberData: Omit<TeamMember, 'id'>) {
  const response = await fetch('/api/admin/team', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(memberData),
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (parseError) {
      console.error('Failed to parse error response as JSON:', parseError);
      console.error('Raw response status:', response.status);
      console.error('Raw response statusText:', response.statusText);
      throw new Error(`Failed to create team member: ${response.status} ${response.statusText}`);
    }
    
    console.error('Team member creation failed. Status:', response.status);
    console.error('Response data:', JSON.stringify(errorData, null, 2));
    
    // Create a more detailed error message
    let errorMessage = errorData.error || 'Failed to create team member';
    if (errorData.details) {
      errorMessage += `\nDetails: ${errorData.details}`;
    }
    if (errorData.hint) {
      errorMessage += `\nHint: ${errorData.hint}`;
    }
    
    throw new Error(errorMessage);
  }

  const result = await response.json();
  
  if (!result.success) {
    console.error('Team member creation result failed:', result);
    throw new Error(result.error || 'Failed to create team member');
  }

  return {
    user: result.user,
    temporaryPassword: result.temporaryPassword
  };
}

export async function updateTeamMember(id: string, updates: Partial<TeamMember>) {
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from('user')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating team member:', error);
    throw error;
  }

  return data;
}


export async function fetchTeamMemberStats(userId: string) {
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch completed jobs
  const { data: completedJobs } = await supabase
    .from('job_assignment')
    .select('id')
    .eq('employee_id', userId)
    .eq('status', 'completed');

  // Fetch upcoming jobs
  const { data: upcomingJobs } = await supabase
    .from('job_assignment')
    .select('id')
    .eq('employee_id', userId)
    .gt('start_time', new Date().toISOString())
    .not('status', 'eq', 'completed');

  // Fetch availability count
  const { data: availabilityCount } = await supabase
    .from('availability')
    .select('id')
    .eq('user_id', userId)
    .eq('is_available', true)
    .gte('date', new Date().toISOString().split('T')[0]);

  return {
    completedJobs: completedJobs?.length || 0,
    upcomingJobs: upcomingJobs?.length || 0,
    availabilityCount: availabilityCount?.length || 0
  };
}