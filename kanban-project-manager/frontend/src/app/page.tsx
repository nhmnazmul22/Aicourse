"use client";

import { useEffect, useState, useCallback, useRef, useSyncExternalStore } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { useBoardStore } from "@/lib/board-store";
import { boardService } from "@/services/board.service";
import BoardView from "./board";
import LoginPage from "./login/page";
import { AIChatSidebar } from "@/components/ai/ai-chat-sidebar";

function emptySubscribe() {
  return () => {};
}

function useIsMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const cookieToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];
    if (cookieToken) return decodeURIComponent(cookieToken);

    const stored = localStorage.getItem("auth-storage");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed?.state?.token) return parsed.state.token;
    }
  } catch {
    // ignore parse error
  }
  return null;
}

export default function Home() {
  const isMounted = useIsMounted();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isLoading = useAuthStore((state) => state.isLoading);
  const fetchMe = useAuthStore((state) => state.fetchMe);
  const logout = useAuthStore((state) => state.logout);
  const project = useBoardStore((state) => state.project);

  const [authChecked, setAuthChecked] = useState(false);
  const [projectLoaded, setProjectLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const initialLoadedUserRef = useRef<string | null>(null);

  useEffect(() => {
    let active = true;
    const existingToken = token || getStoredToken();
    if (!existingToken && !user) {
      Promise.resolve().then(() => {
        if (active) setAuthChecked(true);
      });
      return () => {
        active = false;
      };
    }
    if (!user) {
      fetchMe()
        .catch(() => {})
        .finally(() => {
          if (active) setAuthChecked(true);
        });
    } else {
      Promise.resolve().then(() => {
        if (active) setAuthChecked(true);
      });
    }
    return () => {
      active = false;
    };
  }, [user, token, fetchMe]);

  const loadInitialData = useCallback(async () => {
    setLoadError(null);
    try {
      const projects = await boardService.listProjects();
      useBoardStore.setState({ projects });

      if (projects.length > 0) {
        const currentSelected = useBoardStore.getState().project;
        const matching = currentSelected
          ? projects.find((p) => p.id === currentSelected.id)
          : null;
        const targetProject = matching || projects[0];
        const projId = targetProject.id || (targetProject as unknown as { _id?: string })._id;

        useBoardStore.getState().setProject(targetProject);
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
    if (!user) {
      initialLoadedUserRef.current = null;
      return;
    }
    if (initialLoadedUserRef.current === user.id) return;
    initialLoadedUserRef.current = user.id;
    loadInitialData();
  }, [user, loadInitialData]);

  // Initial render (SSR and before client auth verification completes):
  // Renders the spinner on both server and client initially.
  // This guarantees:
  // 1. Zero hydration mismatch between server and client.
  // 2. On hard reload for an authenticated user, they never see a flash of the login page.
  if (!isMounted || !authChecked || (!user && (token || isLoading))) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-spinner" />
        </div>
      </div>
    );
  }

  // Auth check complete and user is not authenticated: show login page
  if (!user) {
    return <LoginPage />;
  }

  // Authenticated, loading project data
  if (!projectLoaded) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-spinner" />
        </div>
      </div>
    );
  }

  // Authenticated and loaded, but no project found
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
              onClick={() => {
                initialLoadedUserRef.current = null;
                logout();
              }}
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
