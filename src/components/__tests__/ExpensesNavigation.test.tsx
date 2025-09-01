import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ExpensesNavigation } from "../ExpensesNavigation";

// Mock the router components
vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, children, className, ...props }: any) => (
    <a href={to} className={className} {...props}>
      {children}
    </a>
  ),
  useLocation: () => ({
    pathname: "/expenses/import",
  }),
}));

describe("ExpensesNavigation", () => {
  it("renders all navigation items", () => {
    render(<ExpensesNavigation />);

    // Check for all navigation labels
    expect(screen.getByText("Importar")).toBeInTheDocument();
    expect(screen.getByText("Normalizar")).toBeInTheDocument();
    expect(screen.getByText("Analizar")).toBeInTheDocument();
    expect(screen.getByText("Visualizar")).toBeInTheDocument();
  });

  it("renders navigation descriptions", () => {
    render(<ExpensesNavigation />);

    expect(
      screen.getByText("Upload and validate CSV files")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Review and normalize transaction data")
    ).toBeInTheDocument();
    expect(
      screen.getByText("View monthly summaries and insights")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Interactive charts and visualizations")
    ).toBeInTheDocument();
  });

  it("has proper accessibility attributes", () => {
    render(<ExpensesNavigation />);

    const nav = screen.getByRole("navigation");
    expect(nav).toHaveAttribute("aria-label", "Expense tracker navigation");
  });

  it("creates links with correct href attributes", () => {
    render(<ExpensesNavigation />);

    expect(screen.getByRole("link", { name: /importar/i })).toHaveAttribute(
      "href",
      "/expenses/import"
    );
    expect(screen.getByRole("link", { name: /normalizar/i })).toHaveAttribute(
      "href",
      "/expenses/normalize"
    );
    expect(screen.getByRole("link", { name: /analizar/i })).toHaveAttribute(
      "href",
      "/expenses/analyze"
    );
    expect(screen.getByRole("link", { name: /visualizar/i })).toHaveAttribute(
      "href",
      "/expenses/visualize"
    );
  });

  it("applies active state styling to current route", () => {
    render(<ExpensesNavigation />);

    const importLink = screen.getByRole("link", { name: /importar/i });
    expect(importLink).toHaveAttribute("aria-current", "page");
    expect(importLink).toHaveClass(
      "bg-blue-50",
      "text-blue-700",
      "border-blue-200"
    );
  });

  it("applies inactive state styling to non-current routes", () => {
    render(<ExpensesNavigation />);

    const analyzeLink = screen.getByRole("link", { name: /analizar/i });
    expect(analyzeLink).not.toHaveAttribute("aria-current");
    expect(analyzeLink).toHaveClass("text-gray-600", "border-transparent");
  });
});
