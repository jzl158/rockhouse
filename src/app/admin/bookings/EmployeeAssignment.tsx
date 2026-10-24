'use client';

import { useState, useEffect } from 'react';
import { fetchAvailableEmployees, assignEmployee, createJobAssignment, type Employee } from './bookingHelpers';
import { toast } from 'sonner';

interface EmployeeAssignmentProps {
  bookingId: string;
  currentEmployeeId: string | null;
  onAssign: (employeeId: string | null) => void;
}

export function EmployeeAssignment({ bookingId, currentEmployeeId, onAssign }: EmployeeAssignmentProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(currentEmployeeId);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await fetchAvailableEmployees();
      setEmployees(data);
    } catch (error) {
      console.error('Error loading employees:', error);
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    try {
      setAssigning(true);
      
      // If we're unassigning, just update the booking
      if (!selectedEmployeeId) {
        await assignEmployee(bookingId, null);
        onAssign(null);
        toast.success('Employee unassigned successfully');
        return;
      }

      // First assign the employee to the booking
      await assignEmployee(bookingId, selectedEmployeeId);
      
      // Then create a job assignment
      await createJobAssignment(bookingId, selectedEmployeeId);
      
      onAssign(selectedEmployeeId);
      toast.success('Employee assigned successfully');
    } catch (error) {
      console.error('Error assigning employee:', error);
      toast.error('Failed to assign employee');
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Loading employees...</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xs text-gray-500 mb-1">Assign Employee</div>
        <select
          value={selectedEmployeeId || ''}
          onChange={(e) => setSelectedEmployeeId(e.target.value || null)}
          className="rounded border px-2 py-1 w-full bg-white dark:bg-gray-900"
        >
          <option value="">Select an employee</option>
          {employees.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.firstName} {employee.lastName} - {employee.position}
            </option>
          ))}
        </select>
      </div>

      {selectedEmployeeId && selectedEmployeeId !== currentEmployeeId && (
        <div className="text-sm text-yellow-600 dark:text-yellow-400">
          Note: Assigning an employee will create a job assignment and update the booking status.
        </div>
      )}

      <div className="flex justify-end gap-2">
        {currentEmployeeId && (
          <button
            onClick={() => setSelectedEmployeeId(null)}
            className="rounded border px-3 py-1 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
            disabled={assigning}
          >
            Clear
          </button>
        )}
        <button
          onClick={handleAssign}
          className="rounded bg-blue-500 text-white px-3 py-1 text-sm hover:bg-blue-600 disabled:opacity-50"
          disabled={assigning || selectedEmployeeId === currentEmployeeId}
        >
          {assigning ? 'Assigning...' : selectedEmployeeId ? 'Assign Employee' : 'Unassign Employee'}
        </button>
      </div>
    </div>
  );
}
