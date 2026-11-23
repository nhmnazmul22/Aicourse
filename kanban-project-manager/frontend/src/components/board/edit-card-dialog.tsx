"use client";

import React, { useState } from "react";
import { Icon } from "./icon";
import type { Card } from "@/services/board.service";

interface EditCardDialogProps {
  card: Card;
  columnId: string;
  onSave: (id: string, columnId: string, title: string, details: string) => void;
  onClose: () => void;
}

export function EditCardDialog({
  card,
  columnId,
  onSave,
  onClose,
}: EditCardDialogProps) {
  const [title, setTitle] = useState(card.title);
  const [details, setDetails] = useState(card.details || "");

  return (
    <div
      className="dialog-backdrop fixed inset-0 z-50 grid place-items-center p-5 bg-navy/40 backdrop-blur-xs"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="edit-dialog w-full max-w-[440px] p-6 border border-line rounded-xl bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-title"
      >
        <div className="dialog-heading flex items-start justify-between mb-5">
          <div>
            <span className="dialog-kicker text-support text-[10px] font-semibold uppercase tracking-wider">
              Card details
            </span>
            <h2 id="edit-title" className="text-navy text-[20px] font-bold tracking-tight mt-1">
              Edit card
            </h2>
          </div>
          <button
            className="icon-button w-7 h-7 flex items-center justify-center rounded-lg text-support hover:bg-gray-100 hover:text-navy cursor-pointer transition-colors"
            type="button"
            aria-label="Close dialog"
            onClick={onClose}
          >
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>
        <form
          className="flex flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (title.trim()) {
              onSave(card.id, columnId, title.trim(), details.trim());
              onClose();
            }
          }}
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor="edit-card-title" className="text-[11px] font-semibold text-gray-700">
              Title
            </label>
            <input
              id="edit-card-title"
              autoFocus
              className="w-full min-h-[36px] px-3 py-1.5 border border-line rounded-md text-[13px] text-ink focus:border-blue outline-none"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="edit-card-details" className="text-[11px] font-semibold text-gray-700">
              Details
            </label>
            <textarea
              id="edit-card-details"
              rows={5}
              className="w-full p-3 border border-line rounded-md text-[13px] text-ink focus:border-blue outline-none resize-y"
              value={details}
              onChange={(event) => setDetails(event.target.value)}
            />
          </div>
          <div className="form-actions dialog-actions flex items-center justify-end gap-2 mt-3">
            <button
              className="button button-primary min-h-[35px] px-4 rounded-md bg-purple text-white text-xs font-semibold hover:bg-purple/90 disabled:opacity-50 cursor-pointer"
              type="submit"
              disabled={!title.trim()}
            >
              Save changes
            </button>
            <button
              className="button button-quiet min-h-[35px] px-4 rounded-md border border-line bg-white text-support text-xs font-semibold hover:bg-gray-50 cursor-pointer"
              type="button"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
