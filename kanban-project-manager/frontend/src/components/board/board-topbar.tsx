"use client";

import React from "react";
import type { Project } from "@/services/board.service";

interface BoardTopbarProps {
  projects: Project[];
  selectedProjectId: string;
  userName?: string;
  onSelectProject: (id: string) => void;
  onNewProject: () => void;
  onLogout: () => void;
}

export function BoardTopbar({
  projects,
  selectedProjectId,
  userName,
  onSelectProject,
  onNewProject,
  onLogout,
}: BoardTopbarProps) {
  return (
    <header className="topbar h-[70px] flex items-center justify-between px-[5.3vw] bg-white border-b border-[#e9edf2]">
      <a className="brand inline-flex items-center gap-2.5 text-navy text-[18px] font-bold tracking-tight no-underline" href="#board" aria-label="Flowboard home">
        <span className="brand-mark w-[25px] h-[25px] flex items-end gap-[3px] p-[5px] rounded-[8px_8px_8px_3px] bg-navy -rotate-2" aria-hidden="true">
          <i className="block flex-1 h-[7px] rounded-[2px_2px_1px_1px] bg-white opacity-70" />
          <i className="block flex-1 h-[11px] rounded-[2px_2px_1px_1px] bg-yellow" />
          <i className="block flex-1 h-[14px] rounded-[2px_2px_1px_1px] bg-white opacity-90" />
        </span>
        <span>flowboard</span>
      </a>

      <div className="topbar-right flex items-center gap-4">
        <div className="project-selector-wrapper flex items-center gap-2">
          <select
            className="project-select h-8 px-2.5 border border-line rounded-md text-[13px] font-semibold text-navy bg-white cursor-pointer outline-none focus:border-blue"
            value={selectedProjectId}
            onChange={(e) => onSelectProject(e.target.value)}
            aria-label="Select project"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <button
            className="button button-quiet min-h-[31px] px-3 rounded-md border border-line bg-white text-support text-[11px] font-semibold hover:bg-gray-50 cursor-pointer"
            type="button"
            onClick={onNewProject}
            aria-label="New project"
          >
            + Project
          </button>
        </div>

        <span className="avatar w-[31px] h-[31px] grid place-items-center border-2 border-white rounded-full bg-[#efe7f3] text-purple text-xs font-bold ring-1 ring-[#e5d8eb]" aria-label="Your profile">
          {userName ? userName.slice(0, 1).toUpperCase() : "A"}
        </span>

        <button
          className="button button-quiet min-h-[31px] px-3 rounded-md border border-line bg-white text-support text-[11px] font-semibold hover:bg-gray-50 cursor-pointer"
          type="button"
          onClick={onLogout}
          aria-label="Log out"
        >
          Log out
        </button>
      </div>
    </header>
  );
}
