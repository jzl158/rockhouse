'use client';

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

interface ProjectCardProps {
  project: {
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
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
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
    <Link href={`/admin/projects/${project.id}`}>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold">{project.customer_name}</h3>
              <p className="text-sm text-muted-foreground">{project.reference_number}</p>
            </div>
            <Badge variant="outline" className={getStatusColor(project.status)}>
              {project.status || 'Unknown'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="space-y-2">
            <div>
              <p className="text-sm font-medium">Service Type</p>
              <p className="text-sm text-muted-foreground">{project.service_type}</p>
            </div>
            {project.current_phase && (
              <div>
                <p className="text-sm font-medium">Current Phase</p>
                <p className="text-sm text-muted-foreground">{project.current_phase.phase_name}</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <div className="w-full">
            <p className="text-sm text-muted-foreground">
              Preferred Date: {project.preferred_date ? formatDate(project.preferred_date) : 'Not set'}
            </p>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
