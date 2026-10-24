'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { fetchProjectById } from '@/app/components/projects/projectHelpers';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProjectDetails, ProjectPriority, CommunicationType } from '@/types/project.types';
import { format } from 'date-fns';

export default function ProjectDetailsPage() {
  const { projectId } = useParams();
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProject = async () => {
      if (!projectId) {
        setError('Project ID is missing');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        const data = await fetchProjectById(projectId as string);
        setProject(data);
      } catch (err) {
        if (err instanceof Error) {
          // Use the specific error message from our improved error handling
          setError(err.message);
        } else {
          setError('Failed to load project details');
        }
        console.error('Error loading project:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProject();
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Project not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Project Details</h1>
        <Badge>{project.status}</Badge>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h2 className="text-sm font-medium text-gray-500">Customer Name</h2>
            <p className="mt-1">{project.customer_name}</p>
          </div>
          <div>
            <h2 className="text-sm font-medium text-gray-500">Reference Number</h2>
            <p className="mt-1">{project.reference_number}</p>
          </div>
          <div>
            <h2 className="text-sm font-medium text-gray-500">Service Type</h2>
            <p className="mt-1">{project.service_type}</p>
          </div>
          <div>
            <h2 className="text-sm font-medium text-gray-500">Preferred Date</h2>
            <p className="mt-1">{new Date(project.preferred_date).toLocaleDateString()}</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Project Team Members */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Team Members</h2>
          <div className="space-y-4">
            {project.project_team_members
              .filter(member => member.is_active)
              .map(member => (
                <div key={member.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {member.user.firstName} {member.user.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{member.role}</p>
                  </div>
                  <Badge>{format(new Date(member.assigned_at), 'MMM d, yyyy')}</Badge>
                </div>
              ))}
          </div>
        </Card>

        {/* Project Checklist */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Checklist</h2>
          <div className="space-y-3">
            {project.project_checklist
              .sort((a, b) => {
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                return (priorityOrder[a.priority as ProjectPriority] || 0) - (priorityOrder[b.priority as ProjectPriority] || 0);
              })
              .map(item => (
                <div key={item.id} className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={item.is_completed}
                    className="mt-1"
                    readOnly
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{item.title}</p>
                      <Badge variant={item.priority as ProjectPriority}>{item.priority}</Badge>
                    </div>
                    {item.description && (
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    )}
                    {item.due_date && (
                      <p className="text-xs text-gray-500 mt-1">
                        Due: {format(new Date(item.due_date), 'MMM d, yyyy')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </Card>

        {/* Project Notes */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Notes</h2>
          <div className="space-y-4">
            {project.project_notes
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .map(note => (
                <div key={note.id} className="border-b border-gray-200 last:border-0 pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant={note.is_private ? 'destructive' : 'default'}>
                      {note.note_type}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {format(new Date(note.created_at), 'MMM d, yyyy h:mm a')}
                    </span>
                  </div>
                  <p className="mt-2 text-sm">{note.content}</p>
                </div>
              ))}
          </div>
        </Card>

        {/* Project Communications */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Communications</h2>
          <div className="space-y-4">
            {project.project_communications
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .map(comm => (
                <div key={comm.id} className="border-b border-gray-200 last:border-0 pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={comm.direction === 'incoming' ? 'secondary' : 'default'}>
                        {comm.direction}
                      </Badge>
                      <Badge variant="outline">{comm.communication_type as CommunicationType}</Badge>
                    </div>
                    <span className="text-xs text-gray-500">
                      {format(new Date(comm.created_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                  {comm.contact_person && (
                    <p className="text-sm text-gray-600 mt-1">{comm.contact_person}</p>
                  )}
                  <p className="mt-2 text-sm">{comm.content}</p>
                  {comm.follow_up_required && (
                    <div className="mt-2 text-xs text-amber-600">
                      Follow-up required by: {format(new Date(comm.follow_up_date!), 'MMM d, yyyy')}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </Card>
      </div>

      {/* Project Phases */}
      {project.project_phases?.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Project Phases</h2>
          <div className="grid gap-4">
            {project.project_phases
              .sort((a, b) => a.order_number - b.order_number)
              .map(phase => (
                <Card key={phase.id} className="p-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">{phase.phase_name}</h3>
                    <Badge variant={phase.status === 'completed' ? 'default' : 'secondary'}>
                      {phase.status || 'pending'}
                    </Badge>
                  </div>
                  {phase.description && (
                    <p className="mt-2 text-sm text-gray-600">{phase.description}</p>
                  )}
                  <div className="mt-2 text-sm text-gray-500 space-y-1">
                    {phase.start_date && (
                      <div>Start: {format(new Date(phase.start_date), 'MMM d, yyyy')}</div>
                    )}
                    {phase.completion_date && (
                      <div>Completion: {format(new Date(phase.completion_date), 'MMM d, yyyy')}</div>
                    )}
                    {phase.assigned_to && (
                      <div>Assigned to: {phase.assigned_to}</div>
                    )}
                    <div className="text-xs">
                      Created by {phase.created_by} on {format(new Date(phase.created_at), 'MMM d, yyyy h:mm a')}
                      {phase.updated_at && phase.updated_at !== phase.created_at && (
                        <span> · Updated {format(new Date(phase.updated_at), 'MMM d, yyyy h:mm a')}</span>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
