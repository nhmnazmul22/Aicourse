import { describe, it, expect } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Icon } from "@/components/board/icon";

describe("Icon component", () => {
  it("renders plus icon SVG", () => {
    const html = renderToStaticMarkup(<Icon name="plus" className="w-5 h-5 text-blue" />);
    expect(html).toContain("<svg");
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain("w-5 h-5 text-blue");
    expect(html).toContain("M10 4v12M4 10h12");
  });

  it("renders close icon SVG", () => {
    const html = renderToStaticMarkup(<Icon name="close" />);
    expect(html).toContain("<svg");
    expect(html).toContain("m5 5 10 10M15 5 5 15");
  });

  it("renders more menu icon SVG with three dots", () => {
    const html = renderToStaticMarkup(<Icon name="more" />);
    expect(html).toContain("<svg");
    expect(html).toContain('cx="4" cy="10"');
    expect(html).toContain('cx="10" cy="10"');
    expect(html).toContain('cx="16" cy="10"');
  });

  it("renders grip drag icon SVG with six dots", () => {
    const html = renderToStaticMarkup(<Icon name="grip" />);
    expect(html).toContain("<svg");
    expect(html).toContain('viewBox="0 0 16 16"');
    expect(html).toContain('cx="5" cy="4"');
    expect(html).toContain('cx="11" cy="12"');
  });

  it("renders arrow icon SVG", () => {
    const html = renderToStaticMarkup(<Icon name="arrow" />);
    expect(html).toContain("<svg");
    expect(html).toContain("M4 10h12m-5-5 5 5-5 5");
  });
});
