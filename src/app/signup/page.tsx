import SignUp from "@/app/components/common/SignUp";
import Link from "next/link";

export default function SignUpPage() {
    return (
        <main className="max-w-6xl mx-auto px-6 py-12">
            <header className="max-w-2xl">
                <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Create your account</h1>
                <p className="mt-3 text-gray-600">Join to manage bookings and track your projects.</p>
            </header>

            <section className="mt-8">
                <div className="bg-white border border-gray-200 rounded-md p-6 max-w-lg">
                    <SignUp />
                    <p className="mt-4 text-sm text-gray-600">
                        Already have an account?{" "}
                        <Link href="/login" className="text-gray-900 underline">Sign in</Link>
                    </p>
                </div>
            </section>
        </main>
    );
}