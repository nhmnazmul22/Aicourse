import { describe, it, expect } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AIChatSidebar } from "@/components/ai/ai-chat-sidebar";

describe("AIChatSidebar component", () => {
  it("renders floating action button with Toggle AI assistant aria-label", () => {
    const html = renderToStaticMarkup(<AIChatSidebar />);

    expect(html).toContain('aria-label="Toggle AI assistant"');
    expect(html).toContain("fixed bottom-6 right-6");
    expect(html).toContain("bg-purple");
    expect(html).toContain("border-yellow");
  });
});
