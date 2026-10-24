'use client';

import { Calendar } from '@/app/components/calendar/Calendar';
import { CalendarFilters } from '@/app/components/calendar/CalendarFilters';
import { Toaster } from 'sonner';

export default function AdminCalendar() {
  const handleFilterChange = (filters: {
    employees: string[];
    showAvailability: boolean;
    showJobs: boolean;
  }) => {
    // TODO: Implement filtering logic
    console.log('Filters changed:', filters);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Calendar & Scheduling</h1>
      </div>

      <CalendarFilters onFilterChange={handleFilterChange} />
      
      <div className="rounded-md border bg-white dark:bg-gray-950">
        <Calendar />
      </div>

      <Toaster />
    </div>
  );
}