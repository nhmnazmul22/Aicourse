import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { EditCardDialog } from "@/components/board/edit-card-dialog";
import type { Card } from "@/services/board.service";

describe("EditCardDialog component", () => {
  const sampleCard: Card = {
    id: "c1",
    title: "Test deployment",
    details: "Verify all pipelines succeed",
    columnId: "col-1",
    position: 0,
  };

  it("renders dialog with role, aria-labelledby, and form fields", () => {
    const html = renderToStaticMarkup(
      <EditCardDialog
        card={sampleCard}
        columnId="col-1"
        onSave={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('aria-labelledby="edit-title"');
    expect(html).toContain('id="edit-title"');
    expect(html).toContain("Edit card");
    expect(html).toContain('value="Test deployment"');
    expect(html).toContain("Verify all pipelines succeed");
  });

  it("renders action buttons: Save changes and Cancel", () => {
    const html = renderToStaticMarkup(
      <EditCardDialog
        card={sampleCard}
        columnId="col-1"
        onSave={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(html).toContain("Save changes");
    expect(html).toContain("Cancel");
    expect(html).toContain('aria-label="Close dialog"');
  });
});
