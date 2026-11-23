"use client";

import React, { useState } from "react";
import { Icon } from "./icon";

interface BoardHeaderProps {
  projectName: string;
  totalCards: number;
  onRenameProject: (newName: string) => void;
  onDeleteProject: () => void;
}

export function BoardHeader({
  projectName,
  totalCards,
  onRenameProject,
  onDeleteProject,
}: BoardHeaderProps) {
  const [renaming, setRenaming] = useState(false);
  const [inputVal, setInputVal] = useState(projectName);

  function handleRenameSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = inputVal.trim();
    if (trimmed && trimmed !== projectName) {
      onRenameProject(trimmed);
    }
    setRenaming(false);
  }

  return (
    <section className="board-intro flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8">
      <div>
        <p className="breadcrumb flex items-center gap-2 mb-4 text-support text-xs font-medium">
          Projects <Icon name="arrow" className="w-3.5 h-3.5 text-support/70 -rotate-45" />{" "}
          <span className="text-gray-700">{projectName || "Product studio"}</span>
        </p>

        <div className="board-title-row flex flex-wrap items-center gap-3">
          {renaming ? (
            <form onSubmit={handleRenameSubmit}>
              <input
                autoFocus
                className="rename-project-input text-[24px] md:text-[32px] font-bold text-navy border border-blue rounded-md px-2 py-0.5 outline-none bg-white"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onBlur={handleRenameSubmit}
              />
            </form>
          ) : (
            <h1
              className="text-navy text-[26px] md:text-[32px] font-bold tracking-tight leading-tight cursor-pointer hover:text-blue transition-colors"
              title="Click to rename project"
              onClick={() => {
                setInputVal(projectName);
                setRenaming(true);
              }}
            >
              {projectName || "Product sprint"}
            </h1>
          )}

          <button
            className="button button-quiet min-h-[29px] px-2.5 rounded-md border border-line bg-white text-support text-[11px] font-semibold hover:bg-red-50 hover:text-red-600 hover:border-red-200 cursor-pointer transition-colors"
            type="button"
            onClick={onDeleteProject}
            aria-label="Delete project"
          >
            Delete project
          </button>

          <span className="live-indicator inline-flex items-center gap-1.5 px-2.5 py-1 border border-[#dbece9] rounded-full bg-[#f1f8f6] text-[#397b72] text-[10px] font-semibold">
            <i className="w-1.5 h-1.5 rounded-full bg-[#56a797]" /> In motion
          </span>
        </div>

        <p className="board-subtitle text-support text-sm mt-2.5">
          A clear view of what the team is shaping this week.
        </p>
      </div>

      <div className="board-summary relative min-w-[120px] flex items-baseline gap-1.5 pb-2 text-navy">
        <span className="summary-number text-2xl font-bold tracking-tight">{totalCards}</span>
        <span className="summary-label text-support text-xs">cards in play</span>
        <span className="summary-rule absolute bottom-0 left-0 w-10 h-0.5 rounded-full bg-yellow" />
      </div>
    </section>
  );
}
