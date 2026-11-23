"use client";

import { useState } from "react";
import { useAuthStore } from "@/lib/auth-store";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [from] = useState(() => {
    if (typeof window !== "undefined") {
      return (new URLSearchParams(window.location.search).get("from") || "/") as string;
    }
    return "/";
  });
  const login = useAuthStore((state) => state.login);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push(from);
    } catch {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page min-h-screen flex items-center justify-center bg-paper p-4">
      <div className="auth-card w-full max-w-[400px] p-8 bg-white border border-line rounded-xl shadow-xs">
        <h1 className="auth-title text-2xl font-bold text-navy tracking-tight mb-2">Sign in</h1>
        <p className="auth-subtitle text-sm text-support mb-6">Welcome back to Flowboard</p>
        {error && (
          <div className="auth-error mb-4 p-3 rounded-md bg-[#fff0ef] text-[#c45c53] text-sm" role="alert">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="auth-form flex flex-col gap-3.5">
          <div className="auth-field flex flex-col gap-1.5">
            <label htmlFor="email" className="text-xs font-semibold text-gray-700">Email address</label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              className="min-h-[38px] px-2.5 py-2 border border-line rounded-md text-sm text-ink bg-white focus:outline-none focus:border-blue"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="auth-field flex flex-col gap-1.5">
            <label htmlFor="password" className="text-xs font-semibold text-gray-700">Password</label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              className="min-h-[38px] px-2.5 py-2 border border-line rounded-md text-sm text-ink bg-white focus:outline-none focus:border-blue"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="auth-submit mt-2 h-[42px] bg-purple hover:bg-purple/90 text-white font-semibold text-sm rounded-md" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
        <p className="auth-footer mt-4 text-xs text-support text-center">
          Don&apos;t have an account?{" "}
          <Link href={`/signup?from=${encodeURIComponent(from)}`} className="text-blue font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
