import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ExpensesLayout } from "../ExpensesLayout";

// Mock the router components
vi.mock("@tanstack/react-router", () => ({
  Outlet: () => <div data-testid="outlet">Outlet Content</div>,
}));

// Mock the navigation component
vi.mock("../../components/ExpensesNavigation", () => ({
  ExpensesNavigation: () => (
    <nav data-testid="expenses-navigation">Navigation</nav>
  ),
}));

describe("ExpensesLayout", () => {
  it("renders the layout structure correctly", () => {
    render(<ExpensesLayout />);

    // Check for main structural elements
    expect(screen.getByRole("banner")).toBeInTheDocument(); // header
    expect(screen.getByRole("main")).toBeInTheDocument(); // main content area
    expect(screen.getByText("Expense Tracker")).toBeInTheDocument(); // title
  });

  it("includes the navigation component", () => {
    render(<ExpensesLayout />);

    expect(screen.getByTestId("expenses-navigation")).toBeInTheDocument();
  });

  it("includes the outlet for child routes", () => {
    render(<ExpensesLayout />);

    expect(screen.getByTestId("outlet")).toBeInTheDocument();
  });

  it("has proper accessibility structure", () => {
    render(<ExpensesLayout />);

    // Check for semantic HTML structure
    const header = screen.getByRole("banner");
    const main = screen.getByRole("main");

    expect(header).toBeInTheDocument();
    expect(main).toBeInTheDocument();
  });

  it("applies correct CSS classes for styling", () => {
    render(<ExpensesLayout />);

    const container = screen.getByRole("banner").closest("div");
    expect(container).toHaveClass("min-h-screen", "bg-gray-50");
  });
});
