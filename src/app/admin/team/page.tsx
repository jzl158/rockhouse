'use client';

import { useState, useEffect } from 'react';
import { TeamMemberCard } from '@/app/components/team/TeamMemberCard';
import { TeamMemberDialog } from '@/app/components/team/TeamMemberDialog';
import { PasswordDisplayDialog } from '@/app/components/team/PasswordDisplayDialog';
import { fetchTeamMembers, updateTeamMember, createTeamMember, type TeamMember } from '@/app/components/team/teamHelpers';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';

export default function AdminTeam() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [newUserCredentials, setNewUserCredentials] = useState<{ user: TeamMember; password: string } | null>(null);

  useEffect(() => {
    loadTeamMembers();
  }, []);

  const loadTeamMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching team members...');
      const members = await fetchTeamMembers();
      console.log('Fetched team members:', members);
      setTeamMembers(members);
    } catch (err) {
      console.error('Error loading team members:', err);
      setError(err instanceof Error ? err.message : 'Failed to load team members');
      toast.error('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  const handleEditMember = (member: TeamMember) => {
    setSelectedMember(member);
    setDialogOpen(true);
  };

  const handleAddMember = () => {
    setSelectedMember(null);
    setDialogOpen(true);
  };

  const handleSaveMember = async (updatedMember: TeamMember) => {
    try {
      await updateTeamMember(updatedMember.id, updatedMember);
      setDialogOpen(false);
      setSelectedMember(null);
      loadTeamMembers(); // Reload the list
      toast.success('Team member updated successfully');
    } catch (err) {
      console.error('Error updating team member:', err);
      toast.error('Failed to update team member');
    }
  };

  const handleCreateMember = async (memberData: Omit<TeamMember, 'id'>) => {
    try {
      const result = await createTeamMember(memberData);
      setDialogOpen(false);
      setSelectedMember(null);
      
      // Show password dialog with credentials
      setNewUserCredentials({
        user: result.user,
        password: result.temporaryPassword
      });
      setPasswordDialogOpen(true);
      
      loadTeamMembers(); // Reload the list
    } catch (err) {
      console.error('Error creating team member:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to create team member');
    }
  };

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = 
      `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.position?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'active' && member.is_active) ||
      (statusFilter === 'inactive' && !member.is_active);

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading team members...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Team Management</h1>
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">
            Total Members: {teamMembers.length}
          </p>
          <Button onClick={handleAddMember}>
            Add New Member
          </Button>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <Input
            placeholder="Search team members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value: 'all' | 'active' | 'inactive') => setStatusFilter(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Members</SelectItem>
            <SelectItem value="active">Active Only</SelectItem>
            <SelectItem value="inactive">Inactive Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {teamMembers.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-lg text-muted-foreground">No team members found</p>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-lg text-muted-foreground">No team members match your search</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <TeamMemberCard
              key={member.id}
              member={member}
              onEdit={handleEditMember}
            />
          ))}
        </div>
      )}

      <TeamMemberDialog
        member={selectedMember}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSaveMember}
        onCreate={handleCreateMember}
      />

      <PasswordDisplayDialog
        user={newUserCredentials?.user || null}
        password={newUserCredentials?.password || ''}
        open={passwordDialogOpen}
        onOpenChange={setPasswordDialogOpen}
      />
    </div>
  );
}