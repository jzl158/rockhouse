"use client";
import React from "react";
import { Form, Input, Button, Link } from "@heroui/react";
import { supabase } from "@/lib/supabase/client";

export default function SignUp() {
  const [submitted, setSubmitted] = React.useState<Record<string, any> | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  // controlled state for passwords
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");

  // per-field error strings (can contain multiple reasons joined with \n)
  const [errors, setErrors] = React.useState<{ 
    password?: string; 
    confirmPassword?: string; 
    email?: string;
    firstName?: string;
    lastName?: string;
  }>({});

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

  const validateEmail = (em: string) => {
    const reasons: string[] = [];
    if (!em) reasons.push("Please enter your email");
    else if (!/^\S+@\S+\.\S+$/.test(em)) reasons.push("Please enter a valid email");
    return reasons;
  };

  const validateName = (name: string, fieldName: string) => {
    const reasons: string[] = [];
    if (!name) reasons.push(`Please enter your ${fieldName.toLowerCase()}`);
    else if (name.length < 2) reasons.push(`${fieldName} must be at least 2 characters`);
    return reasons;
  };

  const runFieldValidation = (pw: string, pw2: string, em: string, fn: string, ln: string) => {
    const pwErrors = validatePassword(pw);
    const cpErrors = validateConfirm(pw, pw2);
    const emailErrors = validateEmail(em);
    const firstNameErrors = validateName(fn, "First name");
    const lastNameErrors = validateName(ln, "Last name");
    
    return {
      password: pwErrors.length ? pwErrors.join("\n") : undefined,
      confirmPassword: cpErrors.length ? cpErrors.join("\n") : undefined,
      email: emailErrors.length ? emailErrors.join("\n") : undefined,
      firstName: firstNameErrors.length ? firstNameErrors.join("\n") : undefined,
      lastName: lastNameErrors.length ? lastNameErrors.join("\n") : undefined,
    };
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError(null);

    // validate all fields
    const fieldErrors = runFieldValidation(password, confirmPassword, email, firstName, lastName);
    setErrors(fieldErrors);
    const hasErrors = Boolean(
      fieldErrors.password || 
      fieldErrors.confirmPassword || 
      fieldErrors.email ||
      fieldErrors.firstName ||
      fieldErrors.lastName
    );
    if (hasErrors) return;

    setLoading(true);
    
    try {
      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        setServerError(authError.message);
        setLoading(false);
        return;
      }

      // If sign up successful, create user profile in database
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('user')
          .insert({
            id: authData.user.id,
            email,
            firstName,
            lastName,
            role: 'customer',
            is_active: true,
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          // Note: User auth account was created but profile failed
          // In production, you might want to handle this differently
        }
      }

      setLoading(false);
      
      // Show success message or redirect
      setSubmitted({ success: true, email });
      
    } catch (error) {
      console.error('Sign up error:', error);
      setServerError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Form className="w-full max-w-xs space-y-4" onSubmit={onSubmit}>
      <Input
        isRequired
        label="First Name"
        classNames={{
          label: "text-white"
        }}
        labelPlacement="outside-left"
        name="firstName"
        placeholder="First Name"
        type="text"
        value={firstName}
        onValueChange={(v) => {
          setFirstName(v);
          setErrors((prev) => ({ ...prev, firstName: undefined }));
        }}
        isInvalid={Boolean(errors.firstName)}
        errorMessage={errors.firstName}
      />
      <Input
        isRequired
        label="Last Name"
        classNames={{
          label: "text-white"
        }}
        labelPlacement="outside-left"
        name="lastName"
        placeholder="Last Name"
        type="text"
        value={lastName}
        onValueChange={(v) => {
          setLastName(v);
          setErrors((prev) => ({ ...prev, lastName: undefined }));
        }}
        isInvalid={Boolean(errors.lastName)}
        errorMessage={errors.lastName}
      />
      <Input
        isRequired
        label="Email"
        classNames={{
          label: "text-white"
        }}
        labelPlacement="outside-left"
        name="email"
        placeholder="Email"
        type="email"
        value={email}
        onValueChange={(v) => {
          setEmail(v);
          setErrors((prev) => ({ ...prev, email: undefined }));
        }}
        isInvalid={Boolean(errors.email)}
        errorMessage={errors.email}
      />

      <Input
        isRequired
        label="Password"
        classNames={{
          label: "text-white"
        }}
        labelPlacement="outside-left"
        name="password"
        placeholder="Enter password"
        type="password"
        value={password}
        onValueChange={(v) => {
          setPassword(v);
          // live-validate both fields so mismatch updates in real time
          setErrors(runFieldValidation(v, confirmPassword, email, firstName, lastName));
        }}
        isInvalid={Boolean(errors.password)}
        errorMessage={errors.password}
      />

      <Input
        isRequired
        label="Confirm Password"
        classNames={{
          label: "text-white"
        }}
        labelPlacement="outside-left"
        name="confirmPassword"
        placeholder="Re-enter password"
        type="password"
        value={confirmPassword}
        onValueChange={(v) => {
          setConfirmPassword(v);
          setErrors(runFieldValidation(password, v, email, firstName, lastName));
        }}
        isInvalid={Boolean(errors.confirmPassword)}
        errorMessage={errors.confirmPassword}
      />

      {serverError && (
        <p className="text-sm text-red-600" role="alert">
          {serverError}
        </p>
      )}

      {submitted?.success && (
        <p className="text-sm text-green-600" role="status">
          Account created successfully! Please check your email to verify your account.
        </p>
      )}

      <Button 
        type="submit" 
        variant="bordered" 
        className="bg-[#F7D566] text-[#255756] w-full rounded-md border-2 border-[#F7D566] hover:bg-[#F7D566]/90"
        isLoading={loading}
        isDisabled={loading}
      >
        Create Account
      </Button>
      <p className="text-xs text-white text-center">
        Already have an account? {""}
        <Link href="/login" className="underline text-[#F7D566] hover:text-[#F7D566]/80">
          Sign in
        </Link>
      </p>
    </Form>
  );
}
