import { Database } from './database.types';

type ProjectPhase = Database['public']['Tables']['project_phases']['Row'];
type ProjectNote = Database['public']['Tables']['project_notes']['Row'];
type ProjectTeamMember = Database['public']['Tables']['project_team_members']['Row'] & {
  user: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
};
type ProjectChecklist = Database['public']['Tables']['project_checklist']['Row'];
type ProjectCommunication = Database['public']['Tables']['project_communications']['Row'];
type Booking = Database['public']['Tables']['booking']['Row'];

export interface ProjectDetails extends Booking {
  project_phases: ProjectPhase[];
  project_notes: ProjectNote[];
  project_team_members: ProjectTeamMember[];
  project_checklist: ProjectChecklist[];
  project_communications: ProjectCommunication[];
}

export interface ProjectTeamMemberWithUser extends ProjectTeamMember {
  user: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
}

export const ProjectPriorities = ['high', 'medium', 'low'] as const;
export type ProjectPriority = typeof ProjectPriorities[number];

export const CommunicationTypes = ['email', 'phone', 'in_person', 'other'] as const;
export type CommunicationType = typeof CommunicationTypes[number];

export const CommunicationDirections = ['incoming', 'outgoing'] as const;
export type CommunicationDirection = typeof CommunicationDirections[number];

export const NoteTypes = ['general', 'client_communication', 'internal'] as const;
export type NoteType = typeof NoteTypes[number];
