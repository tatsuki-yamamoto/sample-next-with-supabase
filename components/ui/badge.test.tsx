import React from "react";
import { render, screen } from "@testing-library/react";
import { Badge, badgeVariants } from "./badge";

describe("Badge", () => {
  it("renders with default props", () => {
    render(<Badge>Default Badge</Badge>);
    const badge = screen.getByText("Default Badge");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("inline-flex");
    expect(badge).toHaveClass("items-center");
    expect(badge).toHaveClass("rounded-full");
    expect(badge).toHaveClass("border");
    expect(badge).toHaveClass("px-2.5");
    expect(badge).toHaveClass("py-0.5");
    expect(badge).toHaveClass("text-xs");
    expect(badge).toHaveClass("font-semibold");
  });

  it("renders with default variant", () => {
    render(<Badge>Default Badge</Badge>);
    const badge = screen.getByText("Default Badge");
    expect(badge).toHaveClass("border-transparent");
    expect(badge).toHaveClass("bg-primary");
    expect(badge).toHaveClass("text-primary-foreground");
  });

  it("renders with secondary variant", () => {
    render(<Badge variant="secondary">Secondary Badge</Badge>);
    const badge = screen.getByText("Secondary Badge");
    expect(badge).toHaveClass("border-transparent");
    expect(badge).toHaveClass("bg-secondary");
    expect(badge).toHaveClass("text-secondary-foreground");
  });

  it("renders with destructive variant", () => {
    render(<Badge variant="destructive">Destructive Badge</Badge>);
    const badge = screen.getByText("Destructive Badge");
    expect(badge).toHaveClass("border-transparent");
    expect(badge).toHaveClass("bg-destructive");
    expect(badge).toHaveClass("text-destructive-foreground");
  });

  it("renders with outline variant", () => {
    render(<Badge variant="outline">Outline Badge</Badge>);
    const badge = screen.getByText("Outline Badge");
    expect(badge).toHaveClass("text-foreground");
  });

  it("accepts custom className", () => {
    render(<Badge className="custom-class">Custom Badge</Badge>);
    const badge = screen.getByText("Custom Badge");
    expect(badge).toHaveClass("custom-class");
  });

  it("forwards props to div element", () => {
    render(<Badge data-testid="badge" role="status">Test Badge</Badge>);
    const badge = screen.getByTestId("badge");
    expect(badge).toHaveAttribute("role", "status");
  });

  it("renders as a div element", () => {
    render(<Badge>Badge Content</Badge>);
    const badge = screen.getByText("Badge Content");
    expect(badge.tagName).toBe("DIV");
  });

  it("handles empty content", () => {
    const { container } = render(<Badge></Badge>);
    const badge = container.querySelector('div[class*="inline-flex"]');
    expect(badge).toBeInTheDocument();
  });

  it("handles children of different types", () => {
    render(
      <Badge>
        <span>Icon</span>
        Badge Text
      </Badge>
    );
    const badge = screen.getByText("Icon");
    expect(badge).toBeInTheDocument();
    expect(screen.getByText("Badge Text")).toBeInTheDocument();
  });
});

describe("badgeVariants", () => {
  it("returns correct classes for default variant", () => {
    const classes = badgeVariants();
    expect(classes).toContain("inline-flex");
    expect(classes).toContain("items-center");
    expect(classes).toContain("rounded-full");
    expect(classes).toContain("border");
    expect(classes).toContain("px-2.5");
    expect(classes).toContain("py-0.5");
    expect(classes).toContain("text-xs");
    expect(classes).toContain("font-semibold");
    expect(classes).toContain("bg-primary");
    expect(classes).toContain("text-primary-foreground");
  });

  it("returns correct classes for secondary variant", () => {
    const classes = badgeVariants({ variant: "secondary" });
    expect(classes).toContain("bg-secondary");
    expect(classes).toContain("text-secondary-foreground");
  });

  it("returns correct classes for destructive variant", () => {
    const classes = badgeVariants({ variant: "destructive" });
    expect(classes).toContain("bg-destructive");
    expect(classes).toContain("text-destructive-foreground");
  });

  it("returns correct classes for outline variant", () => {
    const classes = badgeVariants({ variant: "outline" });
    expect(classes).toContain("text-foreground");
  });
});