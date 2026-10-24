import type { Metadata } from "next";
import { Suspense } from "react";
import ResetPasswordForm from "@/app/components/common/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Set New Password",
  description: "Set your new password",
};

export default function ResetPasswordPage() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[#255756] mb-2">
            Set New Password
          </h1>
          <p className="text-gray-600">
            Enter your new password below.
          </p>
        </div>
        <Suspense fallback={<div>Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </main>
  );
}