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

  if (!isMounted || !authChecked || (!user && (token || isLoading))) {
    return (
      <div className="auth-page min-h-screen flex items-center justify-center bg-paper">
        <div className="auth-card p-8 bg-white border border-line rounded-xl shadow-xs">
          <div className="auth-spinner w-8 h-8 border-[3px] border-[#e1e7ec] border-t-blue rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  if (!projectLoaded) {
    return (
      <div className="auth-page min-h-screen flex items-center justify-center bg-paper">
        <div className="auth-card p-8 bg-white border border-line rounded-xl shadow-xs">
          <div className="auth-spinner w-8 h-8 border-[3px] border-[#e1e7ec] border-t-blue rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="auth-page min-h-screen flex items-center justify-center bg-paper p-4">
        <div className="auth-card w-full max-w-[400px] p-8 bg-white border border-line rounded-xl shadow-xs text-center">
          <h2 className="text-xl font-bold text-navy mb-2">
            {loadError || "No project found"}
          </h2>
          <p className="text-sm text-support mb-6">
            {loadError
              ? "We encountered an issue loading your board."
              : "Create your first project to get started."}
          </p>
          <div className="flex justify-center gap-3">
            <button
              type="button"
              className="px-4 py-2 bg-purple hover:bg-purple/90 text-white text-sm font-semibold rounded-md cursor-pointer"
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
              className="px-4 py-2 bg-blue hover:bg-blue/90 text-white text-sm font-semibold rounded-md cursor-pointer"
              onClick={() => {
                setProjectLoaded(false);
                loadInitialData();
              }}
            >
              Retry
            </button>
            <button
              type="button"
              className="px-4 py-2 border border-line bg-white hover:bg-gray-50 text-ink text-sm font-medium rounded-md cursor-pointer"
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
