import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { BoardTopbar } from "@/components/board/board-topbar";

describe("BoardTopbar component", () => {
  const projects = [
    { id: "p1", name: "Product Studio", userId: "u1", createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "p2", name: "Mobile App", userId: "u1", createdAt: "2026-01-01", updatedAt: "2026-01-01" },
  ];

  it("renders brand logo, project selector, user avatar, and logout button", () => {
    const html = renderToStaticMarkup(
      <BoardTopbar
        projects={projects}
        selectedProjectId="p1"
        userName="Nazmul Hasan"
        onSelectProject={vi.fn()}
        onNewProject={vi.fn()}
        onLogout={vi.fn()}
      />
    );

    expect(html).toContain("flowboard");
    expect(html).toContain('aria-label="Flowboard home"');
    expect(html).toContain('aria-label="Select project"');
    expect(html).toContain("Product Studio");
    expect(html).toContain("Mobile App");
    expect(html).toContain("+ Project");
    expect(html).toContain('aria-label="New project"');
    expect(html).toContain(">N</span>");
    expect(html).toContain("Log out");
    expect(html).toContain('aria-label="Log out"');
  });

  it("defaults to initial avatar letter when no userName provided", () => {
    const html = renderToStaticMarkup(
      <BoardTopbar
        projects={projects}
        selectedProjectId="p1"
        onSelectProject={vi.fn()}
        onNewProject={vi.fn()}
        onLogout={vi.fn()}
      />
    );

    expect(html).toContain(">A</span>");
  });
});
