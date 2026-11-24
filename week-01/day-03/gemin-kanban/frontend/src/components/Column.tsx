import React, { useState, useRef, useEffect } from "react";
import { Droppable } from "@hello-pangea/dnd";
import { Plus, Edit2, Check } from "lucide-react";
import { Column as ColumnType, Card as CardType } from "@/types/kanban";
import { Card } from "./Card";

interface ColumnProps {
  column: ColumnType;
  cards: CardType[];
  onRenameColumn: (columnId: string, newTitle: string) => void;
  onDeleteCard: (cardId: string) => void;
  onOpenAddModal: (columnId: string) => void;
}

export function Column({
  column,
  cards,
  onRenameColumn,
  onDeleteCard,
  onOpenAddModal,
}: ColumnProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(column.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitleInput(column.title);
  }, [column.title]);

  useEffect(() => {
    if (isEditingTitle) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditingTitle]);

  const handleSaveTitle = () => {
    const trimmed = titleInput.trim();
    if (trimmed && trimmed !== column.title) {
      onRenameColumn(column.id, trimmed);
    } else {
      setTitleInput(column.title);
    }
    setIsEditingTitle(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveTitle();
    } else if (e.key === "Escape") {
      setTitleInput(column.title);
      setIsEditingTitle(false);
    }
  };

  return (
    <div
      className="flex flex-col w-72 flex-shrink-0 bg-slate-100/90 rounded-xl border border-slate-200/90 shadow-sm max-h-[calc(100vh-140px)]"
      data-testid={`column-${column.id}`}
    >
      {/* Column Header */}
      <div className="p-3.5 border-b border-slate-200/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ecad0a] flex-shrink-0" />
          {isEditingTitle ? (
            <div className="flex items-center gap-1 flex-1">
              <input
                ref={inputRef}
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={handleKeyDown}
                className="w-full text-xs font-bold text-[#032147] px-2 py-1 bg-white border border-[#209dd7] rounded focus:outline-none ring-1 ring-[#209dd7]"
                data-testid={`column-title-input-${column.id}`}
              />
              <button
                type="button"
                onClick={handleSaveTitle}
                className="p-1 text-[#209dd7] hover:bg-white rounded"
                title="Save title"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div
              className="flex items-center gap-1.5 flex-1 min-w-0 cursor-pointer group"
              onClick={() => setIsEditingTitle(true)}
              title="Click to rename column"
              data-testid={`column-title-${column.id}`}
            >
              <h2 className="text-xs font-bold text-[#032147] uppercase tracking-wider truncate">
                {column.title}
              </h2>
              <Edit2 className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span
            className="text-[11px] font-semibold text-[#888888] bg-slate-200/80 px-2 py-0.5 rounded-full"
            data-testid={`column-count-${column.id}`}
          >
            {cards.length}
          </span>
          <button
            type="button"
            onClick={() => onOpenAddModal(column.id)}
            className="p-1 rounded-md text-slate-500 hover:text-white hover:bg-[#753991] transition-all"
            title="Add card to column"
            aria-label={`Add card to ${column.title}`}
            data-testid={`add-card-button-${column.id}`}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Droppable Card Container */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            data-testid={`droppable-area-${column.id}`}
            className={`flex-1 overflow-y-auto p-2.5 transition-colors duration-150 min-h-[120px] ${
              snapshot.isDraggingOver ? "bg-[#209dd7]/10 rounded-b-xl" : ""
            }`}
          >
            {cards.map((card, index) => (
              <Card
                key={card.id}
                card={card}
                index={index}
                onDelete={onDeleteCard}
              />
            ))}
            {provided.placeholder}

            {cards.length === 0 && !snapshot.isDraggingOver && (
              <div className="h-28 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center p-3 text-center">
                <p className="text-xs text-[#888888] font-medium">
                  No cards in this column
                </p>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}
