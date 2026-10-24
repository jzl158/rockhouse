'use client';

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { fetchEmployees } from "./calendarHelpers";

interface Employee {
  id: string;
  firstName: string | null;
  lastName: string | null;
}

interface CalendarFiltersProps {
  onFilterChange: (filters: {
    employees: string[];
    showAvailability: boolean;
    showJobs: boolean;
    showUnassigned: boolean;
  }) => void;
}

export function CalendarFilters({ onFilterChange }: CalendarFiltersProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [showAvailability, setShowAvailability] = useState(true);
  const [showJobs, setShowJobs] = useState(true);
  const [showUnassigned, setShowUnassigned] = useState(true);

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    onFilterChange({
      employees: selectedEmployees,
      showAvailability,
      showJobs,
      showUnassigned,
    });
  }, [selectedEmployees, showAvailability, showJobs, showUnassigned, onFilterChange]);

  const loadEmployees = async () => {
    try {
      const employeeData = await fetchEmployees();
      setEmployees(employeeData);
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const toggleEmployee = (employeeId: string) => {
    setSelectedEmployees(prev =>
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  return (
    <div className="flex gap-2 mb-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Filter Employees</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Select Employees</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {employees.map((employee) => (
            <DropdownMenuCheckboxItem
              key={employee.id}
              checked={selectedEmployees.includes(employee.id)}
              onCheckedChange={() => toggleEmployee(employee.id)}
            >
              {employee.firstName} {employee.lastName}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Event Types</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuCheckboxItem
            checked={showAvailability}
            onCheckedChange={(checked) => setShowAvailability(checked)}
          >
            Show Availability
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={showJobs}
            onCheckedChange={(checked) => setShowJobs(checked)}
          >
            Show Assigned Jobs
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={showUnassigned}
            onCheckedChange={(checked) => setShowUnassigned(checked)}
          >
            Show Unassigned Bookings
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}