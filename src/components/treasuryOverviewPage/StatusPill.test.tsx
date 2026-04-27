/**
 * StatusPill Tests
 * ─────────────────
 * Tests for the StatusPill component.
 * 
 * Note: jsdom doesn't resolve CSS variables, so we assert the variable
 * names (e.g., "var(--color-success)") rather than resolved RGB values.
 */

import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import StatusPill from "./StatusPill";

describe("StatusPill", () => {
  it("renders status in uppercase", () => {
    render(<StatusPill status="Active" />);
    expect(screen.getByText("ACTIVE")).toBeInTheDocument();
  });

  it("applies correct styles for Active status", () => {
    const { container } = render(<StatusPill status="Active" />);
    const pill = container.firstChild as HTMLElement;
    
    // Check inline styles use CSS variables
    const inlineStyle = pill.getAttribute("style") || "";
    expect(inlineStyle).toContain("var(--color-success)");
    expect(inlineStyle).toContain("var(--color-success-bg)");
  });

  it("applies correct styles for Paused status", () => {
    const { container } = render(<StatusPill status="Paused" />);
    const pill = container.firstChild as HTMLElement;
    
    const inlineStyle = pill.getAttribute("style") || "";
    expect(inlineStyle).toContain("var(--color-warning)");
    expect(inlineStyle).toContain("var(--color-warning-bg)");
  });

  it("applies correct styles for Completed status", () => {
    const { container } = render(<StatusPill status="Completed" />);
    const pill = container.firstChild as HTMLElement;
    
    const inlineStyle = pill.getAttribute("style") || "";
    expect(inlineStyle).toContain("var(--color-info)");
    expect(inlineStyle).toContain("var(--color-info-bg)");
  });
});
