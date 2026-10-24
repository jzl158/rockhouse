'use client';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TeamMember } from "./teamHelpers";
import { useState, useEffect } from "react";

interface TeamMemberDialogProps {
  member: TeamMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (member: TeamMember) => void;
  onCreate?: (memberData: Omit<TeamMember, 'id'>) => void;
  onCreated?: (result: { user: TeamMember; temporaryPassword: string }) => void;
}

export function TeamMemberDialog({
  member,
  open,
  onOpenChange,
  onSave,
  onCreate,
  onCreated,
}: TeamMemberDialogProps) {
  const [formData, setFormData] = useState<Partial<TeamMember>>(member || {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'Employee',
    position: '',
    hire_date: new Date().toISOString().split('T')[0],
    is_active: true,
    is_admin: false,
    address: '',
    specialties: null
  });

  const isCreating = !member;

  // Reset form data when member changes or dialog opens/closes
  useEffect(() => {
    if (open) {
      setFormData(member || {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: 'Employee',
        position: '',
        hire_date: new Date().toISOString().split('T')[0],
        is_active: true,
        is_admin: false,
        address: '',
        specialties: null
      });
    }
  }, [member, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isCreating && onCreate && formData) {
      // Validate required fields for creation
      if (!formData.firstName || !formData.lastName || !formData.email) {
        alert('Please fill in all required fields (First Name, Last Name, Email)');
        return;
      }
      onCreate(formData as Omit<TeamMember, 'id'>);
    } else if (member && formData) {
      onSave({ ...member, ...formData });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isCreating ? 'Add New Team Member' : 'Edit Team Member'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="firstName" className="text-right">
                First Name {isCreating && <span className="text-red-500">*</span>}
              </Label>
              <Input
                id="firstName"
                value={formData.firstName || ''}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lastName" className="text-right">
                Last Name {isCreating && <span className="text-red-500">*</span>}
              </Label>
              <Input
                id="lastName"
                value={formData.lastName || ''}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email {isCreating && <span className="text-red-500">*</span>}
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="position" className="text-right">
                Position
              </Label>
              <Input
                id="position"
                value={formData.position || ''}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="hire_date" className="text-right">
                Hire Date
              </Label>
              <Input
                id="hire_date"
                type="date"
                value={formData.hire_date?.split('T')[0] || ''}
                onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Address
              </Label>
              <Input
                id="address"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Active</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.is_active || false}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_active: checked })
                  }
                />
                <Label>{formData.is_active ? 'Active' : 'Inactive'}</Label>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Admin Access</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.is_admin || false}
                  onChange={(e) =>
                    setFormData({ ...formData, is_admin: e.target.checked })
                  }
                  className="h-4 w-4"
                />
                <Label>Grant admin privileges</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">
              {isCreating ? 'Create Team Member' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
