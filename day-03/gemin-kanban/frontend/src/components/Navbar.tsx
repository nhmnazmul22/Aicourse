import React from "react";
import { LayoutGrid } from "lucide-react";

interface NavbarProps {
  totalCards: number;
}

export function Navbar({ totalCards }: NavbarProps) {
  return (
    <header className="bg-[#032147] border-b-4 border-[#ecad0a] shadow-md px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded bg-white/10 text-[#ecad0a]">
            <LayoutGrid className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">
              Project Management Board
            </h1>
            <p className="text-xs text-[#888888]">
              Single Board Workflow
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-medium text-white">
            <span className="text-[#ecad0a] font-bold mr-1">{totalCards}</span>
            {totalCards === 1 ? "card" : "cards"}
          </div>
        </div>
      </div>
    </header>
  );
}
