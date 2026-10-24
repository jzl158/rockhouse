"use client";
import React from "react";
import { Form, Input, Button, Link } from "@heroui/react";
import { supabase } from "@/lib/supabase/client";
import { useSearchParams, useRouter } from "next/navigation";

export default function ResetPasswordForm() {
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [errors, setErrors] = React.useState<{ password?: string; confirmPassword?: string }>({});
  const [serverError, setServerError] = React.useState<string | null>(null);
  
  const searchParams = useSearchParams();
  const router = useRouter();

  // Check for errors in URL parameters and handle session establishment
  React.useEffect(() => {
    const handleResetAuth = async () => {
      const error = searchParams.get('error');
      const errorCode = searchParams.get('error_code');
      const errorDescription = searchParams.get('error_description');
      
      if (error && errorCode) {
        let message = 'Reset link error occurred.';
        
        if (errorCode === 'otp_expired') {
          message = 'This password reset link has expired. Please request a new one.';
        } else if (error === 'access_denied') {
          message = 'This password reset link is invalid or has expired. Please request a new one.';
        } else if (errorDescription) {
          message = decodeURIComponent(errorDescription);
        }
        
        setServerError(message);
        return;
      }

      // Handle auth callback for valid reset links
      try {
        console.log('Current URL:', window.location.href);
        console.log('Hash params:', window.location.hash);
        
        // Check if we have tokens in the URL hash
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        console.log('Found tokens:', { accessToken: !!accessToken, refreshToken: !!refreshToken });
        
        if (accessToken && refreshToken) {
          console.log('Setting session with tokens');
          // Set the session using the tokens from the reset link
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          
          if (sessionError) {
            console.error('Session error:', sessionError);
            setServerError('Invalid or expired reset link. Please request a new one.');
          } else {
            console.log('Session established successfully');
          }
        } else {
          console.log('No tokens in URL, checking for existing session');
          // Check if user is already authenticated
          const { data: { session } } = await supabase.auth.getSession();
          console.log('Existing session:', !!session);
          if (!session) {
            setServerError('No valid session found. Please use the reset link from your email.');
          }
        }
      } catch (error) {
        console.error('Reset auth error:', error);
        setServerError('Failed to process reset link. Please try again.');
      }
    };

    handleResetAuth();
  }, [searchParams]);

  // return an array of reasons; join them later for display
  const validatePassword = (pw: string) => {
    const reasons: string[] = [];
    if (pw.length < 8) reasons.push("Password must be at least 8 characters");
    if (!/[A-Z]/.test(pw)) reasons.push("Include at least 1 uppercase letter");
    if (!/[a-z]/.test(pw)) reasons.push("Include at least 1 lowercase letter");
    if (!/[0-9]/.test(pw)) reasons.push("Include at least 1 digit");
    return reasons;
  };

  const validateConfirm = (pw: string, pw2: string) => {
    const reasons: string[] = [];
    if (!pw2) reasons.push("Please re-enter your password");
    if (pw && pw2 && pw !== pw2) reasons.push("Passwords do not match");
    return reasons;
  };

  const runFieldValidation = (pw: string, pw2: string) => {
    const pwErrors = validatePassword(pw);
    const cpErrors = validateConfirm(pw, pw2);
    return {
      password: pwErrors.length ? pwErrors.join("\n") : undefined,
      confirmPassword: cpErrors.length ? cpErrors.join("\n") : undefined,
    };
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Form submission started');
    setServerError(null);

    // validate passwords
    const fieldErrors = runFieldValidation(password, confirmPassword);
    setErrors(fieldErrors);
    const hasErrors = Boolean(fieldErrors.password || fieldErrors.confirmPassword);
    if (hasErrors) {
      console.log('Validation errors:', fieldErrors);
      return;
    }

    console.log('Setting loading state to true');
    setLoading(true);

    try {
      // Check if we have a valid session before attempting password update
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setServerError('No valid session found. Please use a fresh reset link from your email.');
        setLoading(false);
        return;
      }

      console.log('Attempting password update with session:', !!session);
      
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        console.error('Password update error:', updateError);
        setServerError(updateError.message);
      } else {
        console.log('Password updated successfully');
        setSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    } catch (err) {
      console.error('Password update error:', err);
      setServerError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-green-800 font-medium mb-2">Password Updated!</h3>
          <p className="text-green-700 text-sm">
            Your password has been successfully updated. You'll be redirected to sign in shortly.
          </p>
        </div>
        <div className="pt-4">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-md bg-[#255756] px-4 py-2 text-white hover:bg-[#418F6D]"
          >
            Continue to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Form className="w-full space-y-4" onSubmit={onSubmit}>
      <Input
        isRequired
        label="New Password"
        labelPlacement="outside-left"
        name="password"
        placeholder="Enter new password"
        type="password"
        value={password}
        onValueChange={(v) => {
          setPassword(v);
          setErrors(runFieldValidation(v, confirmPassword));
        }}
        isInvalid={Boolean(errors.password)}
        errorMessage={errors.password}
      />

      <Input
        isRequired
        label="Confirm New Password"
        labelPlacement="outside-left"
        name="confirmPassword"
        placeholder="Re-enter new password"
        type="password"
        value={confirmPassword}
        onValueChange={(v) => {
          setConfirmPassword(v);
          setErrors(runFieldValidation(password, v));
        }}
        isInvalid={Boolean(errors.confirmPassword)}
        errorMessage={errors.confirmPassword}
      />

      {serverError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600" role="alert">
            {serverError}
          </p>
          {(serverError.includes('expired') || serverError.includes('invalid')) && (
            <div className="mt-3">
              <Link
                href="/forgot-password"
                className="inline-flex items-center justify-center rounded-md bg-[#255756] px-4 py-2 text-white hover:bg-[#418F6D] text-sm"
              >
                Request New Reset Link
              </Link>
            </div>
          )}
        </div>
      )}

      <Button
        type="submit"
        className="w-full bg-[#255756] text-white hover:bg-[#418F6D]"
        isLoading={loading}
        isDisabled={loading}
      >
        Update Password
      </Button>

      <div className="text-center pt-4">
        <p className="text-sm text-gray-600">
          Remember your password?{" "}
          <Link href="/login" className="text-[#255756] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </Form>
  );
}