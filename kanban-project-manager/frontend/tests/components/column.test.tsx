import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Column } from "@/components/board/column";
import type { BoardColumn } from "@/services/board.service";

describe("Column component", () => {
  const sampleColumn: BoardColumn = {
    id: "col-todo",
    name: "To do",
    cards: [
      {
        id: "c1",
        title: "Setup CI pipeline",
        details: "Automate build and tests",
        columnId: "col-todo",
        position: 0,
      },
    ],
  };

  it("renders column with role region and aria-label", () => {
    const html = renderToStaticMarkup(
      <Column
        column={sampleColumn}
        columnIndex={1}
        onRename={vi.fn()}
        onAdd={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(html).toContain('aria-label="To do column"');
    expect(html).toContain("To do");
    expect(html).toContain('aria-label="Add card to To do"');
    expect(html).toContain("Setup CI pipeline");
    expect(html).toContain("1</span>");
  });

  it("shows empty state message when column has no cards", () => {
    const emptyCol: BoardColumn = {
      id: "col-empty",
      name: "Done",
      cards: [],
    };

    const html = renderToStaticMarkup(
      <Column
        column={emptyCol}
        columnIndex={4}
        onRename={vi.fn()}
        onAdd={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(html).toContain("Nothing here yet. Add a card or drop one in.");
    expect(html).toContain("0</span>");
    expect(html).toContain("Add a card");
  });
});
