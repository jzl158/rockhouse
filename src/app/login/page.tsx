// app/login/page.tsx  (or src/app/login/page.tsx)
import type { Metadata } from "next";
import SignIn from "@/app/components/common/SignIn";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your account",
};

export default function LoginPage() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <SignIn />
      </div>
    </main>
  );
}
