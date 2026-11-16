"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/auth-store";
import BoardView from "./board";
import LoginPage from "./login/page";
import { useRouter } from "next/navigation";

export default function Home() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isLoading = useAuthStore((state) => state.isLoading);
  const fetchMe = useAuthStore((state) => state.fetchMe);
  const router = useRouter();

  useEffect(() => {
    if (token) {
      fetchMe();
    }
  }, [token, fetchMe]);

  if (isLoading && !user) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-spinner" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return <BoardView />;
}
