import React from "react";
import { Draggable } from "@hello-pangea/dnd";
import { Trash2, GripVertical } from "lucide-react";
import { Card as CardType } from "@/types/kanban";

interface CardProps {
  card: CardType;
  index: number;
  onDelete: (cardId: string) => void;
}

export function Card({ card, index, onDelete }: CardProps) {
  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          data-testid={`card-${card.id}`}
          className={`group relative bg-white rounded-lg p-3.5 mb-2.5 border transition-all duration-150 select-none ${
            snapshot.isDragging
              ? "shadow-xl ring-2 ring-[#209dd7] border-transparent rotate-1"
              : "shadow-sm border-slate-200/80 hover:shadow-md hover:border-slate-300"
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-1.5 flex-1 min-w-0">
              <div
                {...provided.dragHandleProps}
                className="mt-0.5 text-slate-400 hover:text-[#209dd7] cursor-grab active:cursor-grabbing p-0.5 rounded"
                title="Drag card"
                data-testid={`drag-handle-${card.id}`}
              >
                <GripVertical className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-[#032147] leading-snug break-words">
                {card.title}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onDelete(card.id)}
              className="text-slate-400 hover:text-red-600 transition-colors p-1 rounded hover:bg-slate-100 flex-shrink-0"
              title="Delete card"
              aria-label={`Delete card ${card.title}`}
              data-testid={`delete-card-${card.id}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
          {card.details && (
            <p className="text-xs text-[#888888] mt-2 pl-6 leading-relaxed break-words whitespace-pre-wrap">
              {card.details}
            </p>
          )}
        </div>
      )}
    </Draggable>
  );
}
