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
import { TeamMember } from "./teamHelpers";
import { useState } from "react";
import { Copy, Eye, EyeOff, Check } from "lucide-react";

interface PasswordDisplayDialogProps {
  user: TeamMember | null;
  password: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PasswordDisplayDialog({
  user,
  password,
  open,
  onOpenChange,
}: PasswordDisplayDialogProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyPassword = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy password:', err);
    }
  };

  const handleCopyCredentials = async () => {
    const credentials = `Login Credentials for ${user?.firstName} ${user?.lastName}:
Email: ${user?.email}
Password: ${password}
Login URL: ${window.location.origin}/login

Please change your password after your first login.`;

    try {
      await navigator.clipboard.writeText(credentials);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy credentials:', err);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center text-green-600">
            <Check className="w-5 h-5 mr-2" />
            Team Member Created Successfully!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-800">
              <strong>{user.firstName} {user.lastName}</strong> has been added to your team.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Login Credentials</h3>
            
            <div className="grid gap-4">
              <div>
                <Label htmlFor="user-email">Email</Label>
                <div className="flex gap-2">
                  <Input
                    id="user-email"
                    value={user.email}
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(user.email)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="temp-password">Temporary Password</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="temp-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      readOnly
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCopyPassword}
                    className={copied ? "text-green-600" : ""}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> Please share these credentials securely with the new team member. 
                They should change their password after their first login.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCopyCredentials}
            className={copied ? "text-green-600" : ""}
          >
            {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            Copy All Credentials
          </Button>
          <Button type="button" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}