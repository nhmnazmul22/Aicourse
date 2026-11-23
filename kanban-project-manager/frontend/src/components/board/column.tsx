"use client";

import React, { useState, useRef } from "react";
import { useDroppable } from "@dnd-kit/react";
import { Icon } from "./icon";
import { CardItem } from "./card-item";
import type { BoardColumn, Card } from "@/services/board.service";

interface ColumnProps {
  column: BoardColumn;
  columnIndex?: number;
  onRename: (id: string, name: string) => void;
  onAdd: (columnId: string, title: string, details: string) => void;
  onEdit: (card: Card) => void;
  onDelete: (id: string) => void;
}

const COLUMN_BORDER_COLORS = [
  "border-t-support",
  "border-t-blue",
  "border-t-yellow",
  "border-t-purple",
  "border-t-[#4f9e85]",
];

export function Column({
  column,
  columnIndex = 0,
  onRename,
  onAdd,
  onEdit,
  onDelete,
}: ColumnProps) {
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(column.name);
  const cancelRenameBlur = useRef(false);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");

  const { ref: dropRef, isDropTarget } = useDroppable({
    id: `column-${column.id}`,
    type: "column",
    accept: "card",
  });

  const borderClass = COLUMN_BORDER_COLORS[columnIndex % COLUMN_BORDER_COLORS.length];

  function saveName(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    cancelRenameBlur.current = true;
    commitName();
  }

  function commitName() {
    const trimmedName = name.trim();
    if (trimmedName) onRename(column.id, trimmedName);
    setName(trimmedName || column.name);
    setRenaming(false);
  }

  function saveCard(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) return;
    onAdd(column.id, title, details);
    setTitle("");
    setDetails("");
    setAdding(false);
  }

  return (
    <section
      ref={dropRef}
      data-column={column.id}
      className={`board-column min-w-[210px] p-[16px_11px_13px] border-r border-[#eef1f4] bg-white transition-colors duration-150 last:border-r-0 ${
        isDropTarget ? "is-drop-target bg-[#f5faff]" : ""
      }`}
      aria-label={`${column.name} column`}
    >
      <header className={`column-header min-h-[34px] flex items-center justify-between pb-2.5 pt-1.5 px-0.5 border-t-[3px] ${borderClass}`}>
        <div className="column-heading min-w-0 flex items-center gap-2">
          {renaming ? (
            <form className="rename-form flex items-center" onSubmit={saveName}>
              <label className="sr-only" htmlFor={`rename-${column.id}`}>
                Column name
              </label>
              <input
                id={`rename-${column.id}`}
                autoFocus
                className="w-32 px-1.5 py-0.5 border border-blue rounded text-xs text-navy font-semibold outline-none bg-white"
                value={name}
                onChange={(event) => setName(event.target.value)}
                onBlur={() => {
                  if (cancelRenameBlur.current) {
                    cancelRenameBlur.current = false;
                    return;
                  }
                  commitName();
                }}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    cancelRenameBlur.current = true;
                    setName(column.name);
                    setRenaming(false);
                  }
                }}
                onFocus={(event) => event.currentTarget.select()}
              />
            </form>
          ) : (
            <button
              className="column-name max-w-[150px] truncate py-0.5 border-0 bg-transparent text-[12px] font-bold text-navy hover:text-blue cursor-pointer text-left"
              type="button"
              title="Rename column"
              onClick={() => {
                cancelRenameBlur.current = false;
                setName(column.name);
                setRenaming(true);
              }}
            >
              {column.name}
            </button>
          )}
          <span className="column-count min-w-[21px] h-[21px] px-1.5 grid place-items-center rounded-md bg-gray-100 text-navy text-[11px] font-semibold">
            {column.cards.length}
          </span>
        </div>
        <button
          className="icon-button add-card-icon w-6 h-6 flex items-center justify-center rounded text-support hover:bg-gray-100 hover:text-navy cursor-pointer transition-colors"
          type="button"
          aria-label={`Add card to ${column.name}`}
          onClick={() => setAdding((value) => !value)}
        >
          <Icon name="plus" className="w-3.5 h-3.5" />
        </button>
      </header>

      <div className="column-cards min-h-[82px] flex flex-col gap-2.5" aria-label={`${column.name} cards`}>
        {column.cards.map((card, index) => (
          <CardItem
            key={card.id}
            card={card}
            index={index}
            columnId={column.id}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}

        {column.cards.length === 0 && !adding && (
          <p className="empty-column my-0.5 p-[15px_9px] border border-dashed border-line rounded-md bg-paper text-support text-[11px] leading-relaxed text-center">
            Nothing here yet. Add a card or drop one in.
          </p>
        )}

        {adding && (
          <form className="new-card-form flex flex-col gap-2 p-2.5 border border-line rounded-lg bg-[#fbfdff]" onSubmit={saveCard}>
            <label className="sr-only" htmlFor={`new-title-${column.id}`}>
              Card title
            </label>
            <input
              id={`new-title-${column.id}`}
              autoFocus
              className="w-full min-h-[33px] px-2 py-1.5 border border-line rounded text-xs text-ink bg-white focus:border-blue outline-none"
              placeholder="What needs to get done?"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
            <label className="sr-only" htmlFor={`new-details-${column.id}`}>
              Card details
            </label>
            <textarea
              id={`new-details-${column.id}`}
              className="w-full p-2 border border-line rounded text-xs text-ink bg-white focus:border-blue outline-none resize-y"
              placeholder="Add a few details…"
              rows={3}
              value={details}
              onChange={(event) => setDetails(event.target.value)}
            />
            <div className="form-actions flex items-center gap-2">
              <button
                className="button button-primary min-h-[31px] px-3 rounded bg-purple text-white text-[11px] font-semibold hover:bg-purple/90 disabled:opacity-50 cursor-pointer"
                type="submit"
                disabled={!title.trim()}
              >
                Add card
              </button>
              <button
                className="button button-quiet min-h-[31px] px-3 rounded border border-line bg-white text-support text-[11px] font-semibold hover:bg-gray-50 cursor-pointer"
                type="button"
                onClick={() => setAdding(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {!adding && (
        <button
          className="add-card-row w-full flex items-center gap-2 mt-2 p-1.5 rounded text-[11px] font-medium text-support hover:bg-gray-50 hover:text-blue cursor-pointer transition-colors"
          type="button"
          onClick={() => setAdding(true)}
        >
          <Icon name="plus" className="w-3.5 h-3.5" /> Add a card
        </button>
      )}
    </section>
  );
}
