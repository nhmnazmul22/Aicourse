"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/auth-store";
import BoardView from "./board";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user, token, isLoading, fetchMe } = useAuthStore(
    (state) => ({
      user: state.user,
      token: state.token,
      isLoading: state.isLoading,
      fetchMe: state.fetchMe,
    })
  );
  const router = useRouter();

  useEffect(() => {
    if (token) {
      fetchMe();
    } else {
      router.replace("/login");
    }
  }, [token, fetchMe, router]);

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
    return null;
  }

  return <BoardView />;
}
