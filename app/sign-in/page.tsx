"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignInPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f8fb] px-6 text-gray-950">
      <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-8 shadow-xl">
        <Link href="/" className="text-sm font-semibold text-gray-500">
          ← Back home
        </Link>

        <h1 className="mt-6 text-3xl font-bold">Welcome back</h1>
        <p className="mt-2 text-gray-500">Sign in with email and password.</p>

        <form onSubmit={handleSignIn} className="mt-8 space-y-4">
          <input
            type="email"
            required
            placeholder="Email address"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-950 outline-none focus:border-gray-950 focus:ring-1 focus:ring-gray-950"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            required
            placeholder="Password"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-950 outline-none focus:border-gray-950 focus:ring-1 focus:ring-gray-950"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <div className="rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-700">
              {error}
            </div>
          )}

          <button
            disabled={loading}
            className="w-full rounded-xl bg-gray-950 px-4 py-3 font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="font-semibold text-gray-950">
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}
