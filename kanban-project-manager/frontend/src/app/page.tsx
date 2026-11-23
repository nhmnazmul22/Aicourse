"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { useBoardStore } from "@/lib/board-store";
import { boardService } from "@/services/board.service";
import BoardView from "./board";
import LoginPage from "./login/page";
import { AIChatSidebar } from "@/components/ai/ai-chat-sidebar";

export default function Home() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isLoading = useAuthStore((state) => state.isLoading);
  const fetchMe = useAuthStore((state) => state.fetchMe);
  const logout = useAuthStore((state) => state.logout);
  const project = useBoardStore((state) => state.project);
  const [projectLoaded, setProjectLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      fetchMe().catch(() => {});
    }
  }, [user, fetchMe]);

  const loadInitialData = useCallback(async () => {
    setLoadError(null);
    try {
      const projects = await boardService.listProjects();
      useBoardStore.setState({ projects });
      if (projects.length > 0) {
        const first = projects[0];
        const projId = first.id || (first as unknown as { _id?: string })._id;
        useBoardStore.getState().setProject(first);
        if (projId) {
          await useBoardStore.getState().loadBoard(projId);
          const boardError = useBoardStore.getState().error;
          if (boardError) {
            setLoadError(boardError);
          }
        }
      } else {
        const newProj = await boardService.createProject("My Project");
        const projId = newProj.id || (newProj as unknown as { _id?: string })._id;
        useBoardStore.getState().setProject(newProj);
        if (projId) {
          await useBoardStore.getState().loadBoard(projId);
          const boardError = useBoardStore.getState().error;
          if (boardError) {
            setLoadError(boardError);
          }
        }
        const updatedProjects = await boardService.listProjects();
        useBoardStore.setState({ projects: updatedProjects });
      }
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load project");
    } finally {
      setProjectLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    loadInitialData();
  }, [user, loadInitialData]);

  // Only show spinner when actively authenticating (token exists but user not yet resolved)
  if (token && isLoading && !user) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-spinner" />
        </div>
      </div>
    );
  }

  // Not authenticated — show login immediately, no spinner
  if (!user) {
    return <LoginPage />;
  }

  // Still loading project data
  if (!projectLoaded) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-spinner" />
        </div>
      </div>
    );
  }

  // Finished loading but no project could be loaded or resolved
  if (!project) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#032147", marginBottom: "0.5rem" }}>
            {loadError || "No project found"}
          </h2>
          <p style={{ color: "#888888", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
            {loadError
              ? "We encountered an issue loading your board."
              : "Create your first project to get started."}
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "0.75rem" }}>
            <button
              type="button"
              className="auth-submit"
              style={{ width: "auto", padding: "0.5rem 1.25rem" }}
              onClick={async () => {
                setProjectLoaded(false);
                setLoadError(null);
                try {
                  const newProj = await boardService.createProject(`Project ${Date.now()}`);
                  useBoardStore.getState().setProject(newProj);
                  await useBoardStore.getState().loadBoard(newProj.id);
                  const updatedProjects = await boardService.listProjects();
                  useBoardStore.setState({ projects: updatedProjects });
                } catch (err) {
                  setLoadError(err instanceof Error ? err.message : "Failed to create project");
                } finally {
                  setProjectLoaded(true);
                }
              }}
            >
              Create Project
            </button>
            <button
              type="button"
              className="auth-submit"
              style={{ width: "auto", padding: "0.5rem 1.25rem", backgroundColor: "#209dd7" }}
              onClick={() => {
                setProjectLoaded(false);
                loadInitialData();
              }}
            >
              Retry
            </button>
            <button
              type="button"
              style={{
                padding: "0.5rem 1.25rem",
                borderRadius: "0.375rem",
                border: "1px solid #d1d5db",
                backgroundColor: "#ffffff",
                color: "#374151",
                cursor: "pointer",
                fontWeight: 500,
              }}
              onClick={() => logout()}
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <BoardView projectId={project.id} />
      <AIChatSidebar />
    </>
  );
}
