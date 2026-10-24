'use client';

import { supabase } from '@/lib/supabase/client';
import { Database } from '@/types/database.types';

export type ReportTemplate = Database['public']['Tables']['report_templates']['Row'];
export type SavedReport = Database['public']['Tables']['saved_reports']['Row'];
export type ReportSchedule = Database['public']['Tables']['report_schedules']['Row'];

export interface ReportConfig {
  columns: {
    field: string;
    header: string;
    type: 'text' | 'number' | 'date' | 'boolean';
    format?: string;
  }[];
  filters: {
    field: string;
    operator: 'equals' | 'contains' | 'greater' | 'less' | 'between' | 'in';
    value: any;
  }[];
  sorting: {
    field: string;
    direction: 'asc' | 'desc';
  }[];
  grouping?: {
    field: string;
    aggregates: {
      field: string;
      function: 'sum' | 'avg' | 'count' | 'min' | 'max';
    }[];
  }[];
}

export const ReportTypes = {
  FINANCIAL: 'financial',
  INVENTORY: 'inventory',
  PROJECTS: 'projects',
  CUSTOMER: 'customer',
  EMPLOYEE: 'employee',
  CUSTOM: 'custom'
} as const;

export type ReportType = typeof ReportTypes[keyof typeof ReportTypes];

export async function fetchReportTemplates() {
  const { data: templates, error } = await supabase
    .from('report_templates')
    .select(`
      *,
      created_by_user:created_by (
        firstName,
        lastName
      )
    `)
    .order('name');

  if (error) {
    console.error('Error fetching report templates:', error);
    throw new Error('Failed to fetch report templates');
  }

  return templates;
}

export async function fetchSavedReports() {
  const { data: reports, error } = await supabase
    .from('saved_reports')
    .select(`
      *,
      template:template_id (
        name,
        report_type
      ),
      created_by_user:created_by (
        firstName,
        lastName
      )
    `)
    .order('name');

  if (error) {
    console.error('Error fetching saved reports:', error);
    throw new Error('Failed to fetch saved reports');
  }

  return reports;
}

export async function fetchReportSchedules() {
  const { data: schedules, error } = await supabase
    .from('report_schedules')
    .select(`
      *,
      saved_report:saved_report_id (
        name,
        template:template_id (
          name,
          report_type
        )
      ),
      created_by_user:created_by (
        firstName,
        lastName
      )
    `)
    .order('next_run_at');

  if (error) {
    console.error('Error fetching report schedules:', error);
    throw new Error('Failed to fetch report schedules');
  }

  return schedules;
}

export async function createReportTemplate(
  template: Omit<ReportTemplate, 'id' | 'created_at' | 'created_by'>
) {
  const { data: newTemplate, error } = await supabase
    .from('report_templates')
    .insert({
      ...template,
      created_by: (await supabase.auth.getUser()).data.user?.id
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating report template:', error);
    throw new Error('Failed to create report template');
  }

  return newTemplate;
}

export async function saveReport(
  report: Omit<SavedReport, 'id' | 'created_at' | 'created_by' | 'last_run_at'>
) {
  const { data: savedReport, error } = await supabase
    .from('saved_reports')
    .insert({
      ...report,
      created_by: (await supabase.auth.getUser()).data.user?.id
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving report:', error);
    throw new Error('Failed to save report');
  }

  return savedReport;
}

export async function scheduleReport(
  schedule: Omit<ReportSchedule, 'id' | 'created_at' | 'created_by' | 'last_run_at' | 'next_run_at'>
) {
  const nextRunAt = calculateNextRunDate(schedule.frequency, schedule.schedule_config);

  const { data: newSchedule, error } = await supabase
    .from('report_schedules')
    .insert({
      ...schedule,
      next_run_at: nextRunAt.toISOString(),
      created_by: (await supabase.auth.getUser()).data.user?.id
    })
    .select()
    .single();

  if (error) {
    console.error('Error scheduling report:', error);
    throw new Error('Failed to schedule report');
  }

  return newSchedule;
}

export async function generateReport(reportId: string) {
  const { data: report } = await supabase
    .from('saved_reports')
    .select(`
      *,
      template:template_id (
        *
      )
    `)
    .eq('id', reportId)
    .single();

  if (!report) {
    throw new Error('Report not found');
  }

  // Here you would implement the actual report generation logic
  // This would depend on the report type and configuration
  // For now, we'll just update the last_run_at timestamp

  const { error } = await supabase
    .from('saved_reports')
    .update({
      last_run_at: new Date().toISOString()
    })
    .eq('id', reportId);

  if (error) {
    console.error('Error updating report run time:', error);
    throw new Error('Failed to update report run time');
  }

  return {
    reportData: [], // This would be the actual report data
    generatedAt: new Date().toISOString(),
    config: report.column_config
  };
}

function calculateNextRunDate(frequency: string, config: any): Date {
  const now = new Date();
  
  switch (frequency) {
    case 'daily':
      return new Date(now.setDate(now.getDate() + 1));
    case 'weekly':
      return new Date(now.setDate(now.getDate() + 7));
    case 'monthly':
      return new Date(now.setMonth(now.getMonth() + 1));
    case 'custom':
      // Implement custom schedule calculation based on config
      return now;
    default:
      return now;
  }
}
