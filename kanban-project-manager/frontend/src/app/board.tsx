"use client";

import { useEffect, useRef, useState } from "react";
import {
  DragDropProvider,
  KeyboardSensor,
  PointerSensor,
} from "@dnd-kit/react";
import { isSortable } from "@dnd-kit/react/sortable";
import { useBoardStore } from "@/lib/board-store";
import { useAuthStore } from "@/lib/auth-store";
import { authService } from "@/services/auth.service";
import type { BoardColumn, Card } from "@/services/board.service";
import { BoardTopbar } from "@/components/board/board-topbar";
import { BoardHeader } from "@/components/board/board-header";
import { Column } from "@/components/board/column";
import { EditCardDialog } from "@/components/board/edit-card-dialog";
import { NewProjectModal } from "@/components/board/new-project-modal";

export default function BoardView({ projectId }: { projectId: string }) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const project = useBoardStore((state) => state.project);
  const projects = useBoardStore((state) => state.projects);
  const columns = useBoardStore((state) => state.columns);
  const isLoading = useBoardStore((state) => state.isLoading);
  const error = useBoardStore((state) => state.error);
  const setProject = useBoardStore((state) => state.setProject);
  const loadBoard = useBoardStore((state) => state.loadBoard);
  const createProject = useBoardStore((state) => state.createProject);
  const updateProject = useBoardStore((state) => state.updateProject);
  const deleteProject = useBoardStore((state) => state.deleteProject);
  const renameColumn = useBoardStore((state) => state.renameColumn);
  const addCard = useBoardStore((state) => state.addCard);
  const updateCard = useBoardStore((state) => state.updateCard);
  const deleteCard = useBoardStore((state) => state.deleteCard);
  const moveCard = useBoardStore((state) => state.moveCard);

  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);

  const boardBeforeDrag = useRef<BoardColumn[] | null>(null);
  const lastLoadedBoardRef = useRef<string | null>(null);

  const totalCards = columns.reduce(
    (total, col) => total + (col.cards ? col.cards.length : 0),
    0
  );

  useEffect(() => {
    if (!projectId) return;
    const currentCols = useBoardStore.getState().columns;
    const currentProj = useBoardStore.getState().project;
    if (
      lastLoadedBoardRef.current === projectId &&
      currentProj?.id === projectId &&
      currentCols.length > 0
    ) {
      return;
    }
    lastLoadedBoardRef.current = projectId;
    loadBoard(projectId);
  }, [projectId, loadBoard]);

  async function handleLogout() {
    await authService.logout().catch(() => {});
    logout();
  }

  async function handleCreateProject(name: string) {
    await createProject(name);
  }

  async function handleRenameProject(newName: string) {
    await updateProject(newName);
  }

  async function handleDeleteProject() {
    if (
      window.confirm("Are you sure you want to delete this project and all its cards?")
    ) {
      await deleteProject();
    }
  }

  function handleSelectProject(selectedId: string) {
    if (!selectedId || selectedId === project?.id) return;
    const selected = projects.find((p) => p.id === selectedId);
    if (selected) {
      lastLoadedBoardRef.current = selected.id;
      setProject(selected);
      loadBoard(selected.id);
    }
  }

  function handleDragOver(_event: import("@dnd-kit/react").DragOverEvent) {
    const { source, target } = _event.operation;
    if (!source || !isSortable(source) || source.type !== "card") return;
    _event.preventDefault();
    if (!target) return;
    const targetColumn = isSortable(target)
      ? String(target.group ?? "")
      : String(target.id).replace(/^column-/, "");
    if (!targetColumn) return;
    if (source.id === target.id) return;
    const targetIndex = isSortable(target)
      ? target.index
      : Number.MAX_SAFE_INTEGER;
    boardBeforeDrag.current = columns;
    const sourceColumn = columns.find((col) =>
      col.cards.some((card) => card.id === String(source.id))
    );
    const destination = columns.find((col) => col.id === targetColumn);
    if (!sourceColumn || !destination) return;
    const sourceIndex = sourceColumn.cards.findIndex(
      (card) => card.id === String(source.id)
    );
    if (sourceColumn.id === targetColumn && sourceIndex === targetIndex) return;
    moveCard(String(source.id), targetColumn, targetIndex);
  }

  function handleDragEnd(event: {
    operation?: { canceled?: boolean };
    canceled?: boolean;
  }) {
    if (
      (event.operation?.canceled || event.canceled) &&
      boardBeforeDrag.current
    ) {
      useBoardStore.setState({ columns: boardBeforeDrag.current });
    }
    boardBeforeDrag.current = null;
  }

  const columnIdFromCard = (cardId: string) => {
    const col = columns.find((c) => c.cards.some((card) => card.id === cardId));
    return col?.id;
  };

  function handleDeleteCard(cardId: string) {
    const cid = columnIdFromCard(cardId);
    if (cid) deleteCard(cardId, cid);
  }

  return (
    <main className="app-shell min-h-screen bg-paper">
      <BoardTopbar
        projects={projects}
        selectedProjectId={project?.id || ""}
        userName={user?.name}
        onSelectProject={handleSelectProject}
        onNewProject={() => setShowNewProjectModal(true)}
        onLogout={handleLogout}
      />

      {isLoading && !project && (
        <div className="auth-page min-h-[60vh] flex items-center justify-center">
          <div className="auth-card p-8 bg-white border border-line rounded-xl shadow-xs">
            <div className="auth-spinner w-8 h-8 border-[3px] border-[#e1e7ec] border-t-blue rounded-full animate-spin mx-auto" />
          </div>
        </div>
      )}

      {!isLoading && (
        <div className="page-content max-w-[1680px] mx-auto pt-[51px] px-[5.3vw] pb-[27px]" id="board">
          <BoardHeader
            projectName={project?.name || "Product sprint"}
            totalCards={totalCards}
            onRenameProject={handleRenameProject}
            onDeleteProject={handleDeleteProject}
          />

          {error && (
            <div className="auth-error mb-4 p-3 rounded-md bg-[#fff0ef] text-[#c45c53] text-sm" role="alert">
              {error}
            </div>
          )}

          <section
            className="board-wrap overflow-hidden border border-[#e5eaf0] rounded-xl bg-white shadow-xs"
            aria-label={`${project?.name || "Product sprint"} board`}
          >
            <div className="board-toolbar min-h-[50px] flex items-center justify-between gap-3 px-5 border-b border-[#eef1f4]">
              <div className="toolbar-title flex items-center gap-2 text-xs font-semibold text-[#394f64]">
                <span className="toolbar-indicator w-2 h-2 border-[1.5px] border-blue rounded-xs rotate-45" />{" "}
                Sprint board{" "}
                <span className="toolbar-divider text-gray-300">/</span>{" "}
                <span className="toolbar-muted text-gray-500 font-normal">Week 24</span>
              </div>
              <p className="text-gray-500 text-[11px] m-0">Drag cards to move work forward</p>
            </div>

            <DragDropProvider
              sensors={[
                {
                  plugin: PointerSensor,
                  options: { preventActivation: () => false },
                },
                KeyboardSensor,
              ]}
              onDragStart={() => {
                boardBeforeDrag.current = columns;
              }}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              <div className="board-columns grid grid-cols-5 min-w-[1050px] overflow-x-auto">
                {columns.map((column, index) => (
                  <Column
                    key={column.id}
                    column={column}
                    columnIndex={index}
                    onRename={(id, name) => renameColumn(id, name)}
                    onAdd={(columnId, title, details) =>
                      addCard(columnId, title, details)
                    }
                    onEdit={setEditingCard}
                    onDelete={(id) => handleDeleteCard(id)}
                  />
                ))}
              </div>
            </DragDropProvider>
          </section>

          <footer className="page-footer flex justify-between gap-3 pt-4 text-support text-[11px]">
            <span>Small steps, clear progress.</span>
          </footer>
        </div>
      )}

      {editingCard && (
        <EditCardDialog
          key={editingCard.id}
          card={editingCard}
          columnId={columnIdFromCard(editingCard.id) || ""}
          onSave={(id, cid, title, details) =>
            updateCard(id, cid, title, details)
          }
          onClose={() => setEditingCard(null)}
        />
      )}

      <NewProjectModal
        isOpen={showNewProjectModal}
        onClose={() => setShowNewProjectModal(false)}
        onCreate={handleCreateProject}
      />
    </main>
  );
}
