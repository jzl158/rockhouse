import type { Metadata } from "next";
import ForgotPasswordForm from "@/app/components/common/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Reset your password",
};

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[#255756] mb-2">
            Reset Your Password
          </h1>
          <p className="text-gray-600">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>
        </div>
        <ForgotPasswordForm />
      </div>
    </main>
  );
}