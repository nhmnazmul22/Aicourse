import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NewProjectModal } from "@/components/board/new-project-modal";

describe("NewProjectModal component", () => {
  it("renders nothing when isOpen is false", () => {
    const html = renderToStaticMarkup(
      <NewProjectModal
        isOpen={false}
        onClose={vi.fn()}
        onCreate={vi.fn()}
      />
    );

    expect(html).toBe("");
  });

  it("renders modal dialog when isOpen is true", () => {
    const html = renderToStaticMarkup(
      <NewProjectModal
        isOpen={true}
        onClose={vi.fn()}
        onCreate={vi.fn()}
      />
    );

    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain("Create new project");
    expect(html).toContain('id="new-project-name-input"');
    expect(html).toContain('placeholder="e.g. Mobile App Redesign"');
    expect(html).toContain("Create project");
    expect(html).toContain("Cancel");
  });
});
