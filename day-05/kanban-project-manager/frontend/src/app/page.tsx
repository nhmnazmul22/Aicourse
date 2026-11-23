"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { useBoardStore } from "@/lib/board-store";
import { boardService } from "@/services/board.service";
import BoardView from "./board";
import LoginPage from "./login/page";

export default function Home() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isLoading = useAuthStore((state) => state.isLoading);
  const fetchMe = useAuthStore((state) => state.fetchMe);
  const [projectId, setProjectId] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      fetchMe();
    }
  }, [token, fetchMe]);

  useEffect(() => {
    if (!user || !token) return;

    async function loadProject() {
      try {
        const projects = await boardService.listProjects();
        if (projects.length > 0) {
          useBoardStore.getState().setProject(projects[0]);
          setProjectId(projects[0].id);
        } else {
          const project = await boardService.createProject("My Project");
          useBoardStore.getState().setProject(project);
          setProjectId(project.id);
        }
      } catch {
        // Project loading error handled by store
      }
    }

    loadProject();
  }, [user, token]);

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

  if (!projectId) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-spinner" />
        </div>
      </div>
    );
  }

  return <BoardView projectId={projectId} />;
}
