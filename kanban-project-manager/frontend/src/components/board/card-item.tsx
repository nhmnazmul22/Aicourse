"use client";

import React from "react";
import { useSortable } from "@dnd-kit/react/sortable";
import { Icon } from "./icon";
import type { Card } from "@/services/board.service";

interface CardItemProps {
  card: Card;
  index: number;
  columnId: string;
  onEdit: (card: Card) => void;
  onDelete: (id: string) => void;
}

export function CardItem({
  card,
  index,
  columnId,
  onEdit,
  onDelete,
}: CardItemProps) {
  const { ref, isDragging } = useSortable({
    id: card.id,
    index,
    group: columnId,
    type: "card",
    accept: "card",
  });

  return (
    <article
      ref={ref}
      role="article"
      className={`group task-card relative p-[11px_11px_9px] border border-line border-l-[3px] border-l-blue rounded-[7px] bg-white shadow-xs cursor-grab transition-all duration-150 hover:shadow-md hover:border-line hover:border-l-blue ${
        isDragging ? "is-dragging opacity-60 border-blue shadow-lg" : ""
      }`}
      aria-label={card.title}
    >
      <div className="task-card-top flex items-center justify-between">
        <span className="drag-grip w-5 h-5 inline-flex items-center text-support/50 pointer-events-none" aria-hidden="true">
          <Icon name="grip" className="w-3.5 h-3.5" />
        </span>
        <button
          className="icon-button task-menu w-5 h-5 flex items-center justify-center rounded text-support hover:text-navy hover:bg-gray-100 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
          type="button"
          aria-label={`Edit ${card.title}`}
          onClick={() => onEdit(card)}
        >
          <Icon name="more" className="w-3.5 h-3.5" />
        </button>
      </div>

      <button
        className="task-copy w-full flex flex-col gap-1 my-1.5 p-0 border-0 bg-transparent text-left cursor-pointer"
        type="button"
        onClick={() => onEdit(card)}
      >
        <span className="task-title text-ink text-[13px] font-semibold leading-snug">
          {card.title}
        </span>
        {card.details && (
          <span className="task-details text-support text-[11.5px] leading-relaxed line-clamp-3">
            {card.details}
          </span>
        )}
      </button>

      <div className="task-card-bottom flex items-center justify-between min-h-[19px] mt-1">
        <span
          className="task-mark w-5 h-5 grid place-items-center rounded-md bg-blue/10 text-blue text-[10px] font-bold"
          aria-hidden="true"
        >
          {card.title.slice(0, 1).toUpperCase()}
        </span>
        <button
          className="delete-task w-5 h-5 flex items-center justify-center rounded text-support/60 hover:bg-red-50 hover:text-red-600 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-all cursor-pointer"
          type="button"
          aria-label={`Delete ${card.title}`}
          onClick={() => onDelete(card.id)}
        >
          <Icon name="close" className="w-3.5 h-3.5" />
        </button>
      </div>
    </article>
  );
}
