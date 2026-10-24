"use client";
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Enums } from '@/types/database.types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Enums<'user_role'>[];
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles = [], 
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // Not authenticated
      if (!user) {
        router.push(redirectTo);
        return;
      }

      // Authenticated but no profile (shouldn't happen)
      if (!profile) {
        console.error('User authenticated but no profile found');
        router.push('/login');
        return;
      }

      // Check role permissions
      if (allowedRoles.length > 0 && profile.role) {
        if (!allowedRoles.includes(profile.role)) {
          // Redirect based on user role
          switch (profile.role) {
            case 'customer':
              router.push('/customer');
              break;
            case 'employee':
              router.push('/employee');
              break;
            case 'admin_assist':
              router.push('/admin');
              break;
            default:
              router.push('/');
          }
          return;
        }
      }
    }
  }, [user, profile, loading, allowedRoles, redirectTo, router]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#255756]"></div>
      </div>
    );
  }

  // Not authenticated
  if (!user || !profile) {
    return null;
  }

  // Role not allowed
  if (allowedRoles.length > 0 && profile.role && !allowedRoles.includes(profile.role)) {
    return null;
  }

  return <>{children}</>;
}