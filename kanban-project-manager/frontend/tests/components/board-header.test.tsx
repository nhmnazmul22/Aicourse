import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { BoardHeader } from "@/components/board/board-header";

describe("BoardHeader component", () => {
  it("renders project heading, breadcrumb, card count, and action buttons", () => {
    const html = renderToStaticMarkup(
      <BoardHeader
        projectName="Sprint 42"
        totalCards={8}
        onRenameProject={vi.fn()}
        onDeleteProject={vi.fn()}
      />
    );

    expect(html).toContain("Sprint 42");
    expect(html).toContain("Projects");
    expect(html).toContain("Delete project");
    expect(html).toContain('aria-label="Delete project"');
    expect(html).toContain("In motion");
    expect(html).toContain(">8</span>");
    expect(html).toContain("cards in play");
  });

  it("falls back to default project title when empty", () => {
    const html = renderToStaticMarkup(
      <BoardHeader
        projectName=""
        totalCards={0}
        onRenameProject={vi.fn()}
        onDeleteProject={vi.fn()}
      />
    );

    expect(html).toContain("Product sprint");
    expect(html).toContain(">0</span>");
  });
});
