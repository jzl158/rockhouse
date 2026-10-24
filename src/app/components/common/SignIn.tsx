"use client";
import React from "react";
import { Form, Input, Button, Link, Checkbox } from "@heroui/react";
import { supabase } from "@/lib/supabase/client"; // keep this path if your file is here

export default function SignIn() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [remember, setRemember] = React.useState(false);
  const [errors, setErrors] = React.useState<{ email?: string; password?: string }>({});
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const validate = (em: string, pw: string) => {
    const next: { email?: string; password?: string } = {};
    if (!em) next.email = "Please enter your email";
    else if (!/^\S+@\S+\.\S+$/.test(em)) next.email = "Please enter a valid email";
    if (!pw) next.password = "Please enter your password";
    return next;
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError(null);

    const v = validate(email, password);
    setErrors(v);
    if (v.email || v.password) return;

    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      setServerError(error.message);
      return;
    }

    // Optional: implement "remember me" later by switching storage to sessionStorage when unchecked.
    // For now Supabase persists in localStorage by default.

    // Redirect after sign-in
    window.location.assign("/");
  };

  return (
    <Form className="w-full max-w-xs space-y-4" onSubmit={onSubmit}>
      <Input
        isRequired
        label="Email"
        labelPlacement="outside-left"
        name="email"
        placeholder="you@example.com"
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
        labelPlacement="outside-left"
        name="password"
        placeholder="Enter password"
        type="password"
        value={password}
        onValueChange={(v) => {
          setPassword(v);
          setErrors((prev) => ({ ...prev, password: undefined }));
        }}
        isInvalid={Boolean(errors.password)}
        errorMessage={errors.password}
      />

      <div className="flex items-center justify-between w-full">
        <Checkbox
          isSelected={remember}
          onValueChange={setRemember}
          name="remember"
          className="flex-shrink-0"
        >
          Remember me
        </Checkbox>
        <Link href="/forgot-password" size="sm">
          Forgot password?
        </Link>
      </div>

      {serverError && (
        <p className="text-sm text-red-600" role="alert">
          {serverError}
        </p>
      )}

      <Button
        type="submit"
        className="text-green-500 w-full rounded-full border-2 border-green-500"
        isLoading={loading}
        isDisabled={loading}
        variant="bordered"
      >
        Sign In
      </Button>
    </Form>
  );
}
