'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

interface ProjectListProps {
  projects: Array<{
    id: string;
    reference_number: string;
    customer_name: string;
    status: string | null;
    service_type: string;
    preferred_date: string | null;
    current_phase?: {
      phase_name: string;
      status: string;
    };
  }>;
}

export function ProjectList({ projects }: ProjectListProps) {
  const getStatusColor = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Reference</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Service Type</TableHead>
            <TableHead>Current Phase</TableHead>
            <TableHead>Preferred Date</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id}>
              <TableCell>
                <Link 
                  href={`/admin/projects/${project.id}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {project.reference_number}
                </Link>
              </TableCell>
              <TableCell>{project.customer_name}</TableCell>
              <TableCell>{project.service_type}</TableCell>
              <TableCell>{project.current_phase?.phase_name || 'Not started'}</TableCell>
              <TableCell>
                {project.preferred_date ? formatDate(project.preferred_date) : 'Not set'}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={getStatusColor(project.status)}>
                  {project.status || 'Unknown'}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
