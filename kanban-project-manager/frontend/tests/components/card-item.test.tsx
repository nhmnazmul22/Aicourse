import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CardItem } from "@/components/board/card-item";
import type { Card } from "@/services/board.service";

describe("CardItem component", () => {
  const sampleCard: Card = {
    id: "card-123",
    title: "Implement Auth Flow",
    details: "Ensure tokens are synchronized in cookies and storage",
    columnId: "col-todo",
    position: 0,
  };

  it("renders card title and details with role article and aria-label", () => {
    const html = renderToStaticMarkup(
      <CardItem
        card={sampleCard}
        index={0}
        columnId="col-todo"
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(html).toContain('role="article"');
    expect(html).toContain('aria-label="Implement Auth Flow"');
    expect(html).toContain("Implement Auth Flow");
    expect(html).toContain("Ensure tokens are synchronized in cookies and storage");
  });

  it("renders the initial letter as the task mark", () => {
    const html = renderToStaticMarkup(
      <CardItem
        card={sampleCard}
        index={0}
        columnId="col-todo"
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(html).toContain("task-mark");
    expect(html).toContain(">I</span>");
  });

  it("renders edit and delete action buttons with accessible labels", () => {
    const html = renderToStaticMarkup(
      <CardItem
        card={sampleCard}
        index={0}
        columnId="col-todo"
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(html).toContain('aria-label="Edit Implement Auth Flow"');
    expect(html).toContain('aria-label="Delete Implement Auth Flow"');
  });

  it("handles cards without details cleanly", () => {
    const cardWithoutDetails: Card = {
      id: "card-456",
      title: "Simple Task",
      details: "",
      columnId: "col-todo",
      position: 1,
    };

    const html = renderToStaticMarkup(
      <CardItem
        card={cardWithoutDetails}
        index={1}
        columnId="col-todo"
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(html).toContain("Simple Task");
    expect(html).not.toContain("task-details");
  });
});
