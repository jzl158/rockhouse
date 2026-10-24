'use client';

import { ProjectCard } from "./ProjectCard";

interface ProjectGridProps {
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

export function ProjectGrid({ projects }: ProjectGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
