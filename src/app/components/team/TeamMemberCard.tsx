'use client';

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Calendar, MapPin } from "lucide-react";
import { TeamMember } from "./teamHelpers";
import { useState, useEffect } from "react";
import { fetchTeamMemberStats } from "./teamHelpers";

interface TeamMemberCardProps {
  member: TeamMember;
  onEdit: (member: TeamMember) => void;
}

export function TeamMemberCard({ member, onEdit }: TeamMemberCardProps) {
  const [stats, setStats] = useState({
    completedJobs: 0,
    upcomingJobs: 0,
    availabilityCount: 0
  });

  useEffect(() => {
    loadStats();
  }, [member.id]);

  const loadStats = async () => {
    try {
      const memberStats = await fetchTeamMemberStats(member.id);
      setStats(memberStats);
    } catch (error) {
      console.error('Error loading team member stats:', error);
    }
  };

  return (
    <Card className={!member.is_active ? 'opacity-75' : ''}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">
              {member.firstName} {member.lastName}
            </h3>
            <p className="text-sm text-muted-foreground">{member.position}</p>
          </div>
          <div className="flex flex-col gap-1">
            <Badge 
              variant={member.is_active ? undefined : 'secondary'}
              className={member.is_active ? 'bg-[#d9b85d] hover:bg-[#d9b85d]/80 text-white' : ''}
            >
              {member.is_active ? 'Active' : 'Inactive'}
            </Badge>
            {member.is_admin && (
              <Badge className="bg-[#255756] hover:bg-[#255756]/80 text-white text-xs">
                Admin
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{member.email}</span>
          </div>
          
          {member.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{member.phone}</span>
            </div>
          )}
          
          {member.hire_date && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Hired: {new Date(member.hire_date).toLocaleDateString()}
              </span>
            </div>
          )}
          
          {member.address && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{member.address}</span>
            </div>
          )}

          <div className="pt-3 grid grid-cols-3 gap-2 text-center">
            <div className="bg-blue-50 dark:bg-blue-950 p-2 rounded">
              <p className="text-lg font-semibold">{stats.completedJobs}</p>
              <p className="text-xs text-muted-foreground">Completed Jobs</p>
            </div>
            <div className="bg-green-50 dark:bg-green-950 p-2 rounded">
              <p className="text-lg font-semibold">{stats.upcomingJobs}</p>
              <p className="text-xs text-muted-foreground">Upcoming Jobs</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-950 p-2 rounded">
              <p className="text-lg font-semibold">{stats.availabilityCount}</p>
              <p className="text-xs text-muted-foreground">Available Days</p>
            </div>
          </div>

          {member.specialties && (
            <div className="pt-3">
              <p className="text-sm font-medium mb-2">Specialties</p>
              <div className="flex flex-wrap gap-1">
                {Array.isArray(member.specialties) ? (
                  member.specialties.map((specialty, index) => (
                    <Badge key={index} variant="outline">
                      {specialty}
                    </Badge>
                  ))
                ) : (
                  Object.entries(member.specialties).map(([key, value]) => (
                    value && <Badge key={key} variant="outline">{key}</Badge>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter>
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => onEdit(member)}
        >
          Edit Profile
        </Button>
      </CardFooter>
    </Card>
  );
}
