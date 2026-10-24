import { supabase } from '@/lib/supabase/client';
import { Database } from '@/types/database.types';

export async function fetchProjects(filters?: {
  status?: string[];
  serviceType?: string[];
  phase?: string[];
  searchTerm?: string;
}) {

  let query = supabase
    .from('booking')
    .select(`
      id,
      reference_number,
      customer_name,
      status,
      service_type,
      preferred_date,
      project_phases (
        id,
        phase_name,
        status
      )
    `)
    .order('created_at', { ascending: false });

  // Apply filters
  if (filters?.status?.length) {
    query = query.in('status', filters.status);
  }

  if (filters?.serviceType?.length) {
    query = query.in('service_type', filters.serviceType);
  }

  if (filters?.searchTerm) {
    query = query.or(`
      customer_name.ilike.%${filters.searchTerm}%,
      reference_number.ilike.%${filters.searchTerm}%
    `);
  }

  const { data: projects, error } = await query;

  if (error) {
    console.error('Error fetching projects:', error);
    return [];
  }

  return projects.map(project => ({
    ...project,
    current_phase: project.project_phases?.[0] || null
  }));
}

export async function fetchProjectById(projectId: string) {
  if (!projectId) {
    throw new Error('Project ID is required');
  }

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(projectId)) {
    throw new Error('Invalid project ID format');
  }

  try {
    const { data: project, error } = await supabase
      .from('booking')
      .select(`
        *,
        project_phases!project_phases_booking_id_fkey (
          id,
          phase_name,
          status,
          start_date,
          completion_date,
          description,
          assigned_to,
          order_number,
          created_by,
          created_at,
          updated_at
        ),
        project_notes!project_notes_booking_id_fkey (
          id,
          content,
          created_by,
          created_at,
          updated_at,
          note_type,
          is_private
        ),
        project_team_members!project_team_members_booking_id_fkey (
          id,
          user_id,
          role,
          assigned_at,
          assigned_by,
          is_active,
          user:user_id (
            firstName,
            lastName,
            email
          )
        ),
        project_checklist!project_checklist_booking_id_fkey (
          id,
          phase_id,
          title,
          description,
          is_completed,
          completed_at,
          completed_by,
          due_date,
          created_at,
          priority
        ),
        project_communications!project_communications_booking_id_fkey (
          id,
          communication_type,
          content,
          contact_person,
          direction,
          created_at,
          created_by,
          follow_up_required,
          follow_up_date
        )
      `)
      .eq('id', projectId)
      .single();

    if (error) {
      console.error('Supabase error:', error.message, error.details, error.hint);
      if (error.code === 'PGRST116') {
        throw new Error('Project not found');
      }
      throw new Error(`Database error: ${error.message}`);
    }

    if (!project) {
      throw new Error('Project not found');
    }

    return project;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    console.error('Unexpected error:', error);
    throw new Error('An unexpected error occurred while fetching the project');
  }
}

export async function fetchProjectFilters() {

  // Fetch unique statuses
  const { data: statuses } = await supabase
    .from('booking')
    .select('status')
    .not('status', 'is', null);

  // Fetch unique service types
  const { data: serviceTypes } = await supabase
    .from('booking')
    .select('service_type')
    .not('service_type', 'is', null);

  // Fetch unique phases
  const { data: phases } = await supabase
    .from('project_phases')
    .select('phase_name')
    .not('phase_name', 'is', null);

  return {
    statuses: [...new Set(statuses?.map(s => s.status) || [])],
    serviceTypes: [...new Set(serviceTypes?.map(s => s.service_type) || [])],
    phases: [...new Set(phases?.map(p => p.phase_name) || [])]
  };
}