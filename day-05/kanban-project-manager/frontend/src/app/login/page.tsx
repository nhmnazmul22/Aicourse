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
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Sign in</h1>
        <p className="auth-subtitle">Welcome back to Flowboard</p>
        {error && (
          <div className="auth-error" role="alert">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="auth-submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
        <p className="auth-footer">
          Don&apos;t have an account?{" "}
          <Link href={`/signup?from=${encodeURIComponent(from)}`}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
