"use client";

import React, { useState } from "react";
import { Icon } from "./icon";

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => Promise<void> | void;
}

export function NewProjectModal({
  isOpen,
  onClose,
  onCreate,
}: NewProjectModalProps) {
  const [newProjectName, setNewProjectName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = newProjectName.trim();
    if (!trimmed) return;
    setSubmitting(true);
    try {
      await onCreate(trimmed);
      setNewProjectName("");
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="dialog-backdrop fixed inset-0 z-50 grid place-items-center p-5 bg-navy/40 backdrop-blur-xs"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        className="edit-dialog w-full max-w-[440px] p-6 border border-line rounded-xl bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-project-dialog-title"
      >
        <div className="dialog-heading flex items-start justify-between mb-5">
          <div>
            <span className="dialog-kicker text-support text-[10px] font-semibold uppercase tracking-wider">
              Workspace
            </span>
            <h2 id="new-project-dialog-title" className="text-navy text-[20px] font-bold tracking-tight mt-1">
              Create new project
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
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="new-project-name-input" className="text-[11px] font-semibold text-gray-700">
              Project name
            </label>
            <input
              id="new-project-name-input"
              autoFocus
              placeholder="e.g. Mobile App Redesign"
              className="w-full min-h-[36px] px-3 py-1.5 border border-line rounded-md text-[13px] text-ink focus:border-blue outline-none"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
            />
          </div>
          <div className="form-actions dialog-actions flex items-center justify-end gap-2 mt-3">
            <button
              className="button button-primary min-h-[35px] px-4 rounded-md bg-purple text-white text-xs font-semibold hover:bg-purple/90 disabled:opacity-50 cursor-pointer"
              type="submit"
              disabled={submitting || !newProjectName.trim()}
            >
              {submitting ? "Creating..." : "Create project"}
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
