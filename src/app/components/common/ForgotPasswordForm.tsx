"use client";
import React from "react";
import { Form, Input, Button, Link } from "@heroui/react";
import { supabase } from "@/lib/supabase/client";

export default function ForgotPasswordForm() {
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const validateEmail = (em: string) => {
    if (!em) return "Please enter your email";
    if (!/^\S+@\S+\.\S+$/.test(em)) return "Please enter a valid email";
    return null;
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    setLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        setError(resetError.message);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      console.error('Password reset error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-green-800 font-medium mb-2">Check your email</h3>
          <p className="text-green-700 text-sm">
            We've sent a password reset link to <strong>{email}</strong>
          </p>
        </div>
        <p className="text-sm text-gray-600">
          Didn't receive the email? Check your spam folder or{" "}
          <button
            onClick={() => {
              setSuccess(false);
              setEmail("");
            }}
            className="text-[#255756] hover:underline"
          >
            try again
          </button>
        </p>
        <div className="pt-4">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-md border border-[#255756] px-4 py-2 text-[#255756] hover:bg-[#255756]/10"
          >
            ← Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Form className="w-full space-y-4" onSubmit={onSubmit}>
      <Input
        isRequired
        label="Email Address"
        labelPlacement="outside-left"
        name="email"
        placeholder="you@example.com"
        type="email"
        value={email}
        onValueChange={setEmail}
        isInvalid={Boolean(error && !loading)}
        errorMessage={error && !loading ? error : undefined}
      />

      <Button
        type="submit"
        className="w-full bg-[#255756] text-white hover:bg-[#418F6D]"
        isLoading={loading}
        isDisabled={loading}
      >
        Send Reset Link
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