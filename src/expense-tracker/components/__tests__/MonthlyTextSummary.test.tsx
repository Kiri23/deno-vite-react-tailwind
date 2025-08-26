import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MonthlyTextSummary } from "../MonthlyTextSummary";

describe("MonthlyTextSummary", () => {
  it("renders nothing when summaries array is empty", () => {
    const { container } = render(<MonthlyTextSummary summaries={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders single summary correctly", () => {
    const summaries = [
      "En enero ingresaste $3,000, gastaste $2,500, sobrante $500 (ahorros positivos)",
    ];

    render(<MonthlyTextSummary summaries={summaries} />);

    expect(screen.getByText("Resumen Mensual")).toBeInTheDocument();
    expect(screen.getByText(summaries[0])).toBeInTheDocument();

    // Should not show the multiple months footer for single summary
    expect(screen.queryByText(/mostrando \d+ meses/i)).not.toBeInTheDocument();
  });

  it("renders multiple summaries correctly", () => {
    const summaries = [
      "En enero ingresaste $3,000, gastaste $2,500, sobrante $500 (ahorros positivos)",
      "En febrero ingresaste $3,200, gastaste $2,800, sobrante $400 (ahorros positivos)",
      "En marzo ingresaste $2,800, gastaste $3,000, déficit $200 (gastos exceden ingresos)",
    ];

    render(<MonthlyTextSummary summaries={summaries} />);

    expect(screen.getByText("Resumen Mensual")).toBeInTheDocument();

    // Check all summaries are rendered
    summaries.forEach((summary) => {
      expect(screen.getByText(summary)).toBeInTheDocument();
    });

    // Should show the multiple months footer
    expect(
      screen.getByText("Mostrando 3 meses de actividad financiera")
    ).toBeInTheDocument();
  });

  it("displays summaries with proper spacing and styling", () => {
    const summaries = [
      "En enero ingresaste $3,000, gastaste $2,500, sobrante $500 (ahorros positivos)",
      "En febrero ingresaste $3,200, gastaste $2,800, sobrante $400 (ahorros positivos)",
    ];

    render(<MonthlyTextSummary summaries={summaries} />);

    // Check that summaries are in separate containers
    const summaryElements = screen.getAllByText(/En \w+ ingresaste/);
    expect(summaryElements).toHaveLength(2);

    // Check styling classes are applied
    summaryElements.forEach((element) => {
      const container = element.closest(".p-4");
      expect(container).toHaveClass(
        "bg-gray-50",
        "rounded-lg",
        "border",
        "border-gray-100"
      );
      expect(element).toHaveClass(
        "text-sm",
        "text-gray-800",
        "leading-relaxed"
      );
    });
  });

  it("handles different types of financial summaries", () => {
    const summaries = [
      "En enero ingresaste $3,000, gastaste $2,500, sobrante $500 (ahorros positivos)",
      "En febrero ingresaste $2,000, gastaste $2,500, déficit $500 (gastos exceden ingresos)",
      "En marzo no hubo actividad financiera registrada",
    ];

    render(<MonthlyTextSummary summaries={summaries} />);

    // All different types of summaries should be rendered
    expect(screen.getByText(/ahorros positivos/)).toBeInTheDocument();
    expect(screen.getByText(/gastos exceden ingresos/)).toBeInTheDocument();
    expect(
      screen.getByText(/no hubo actividad financiera/)
    ).toBeInTheDocument();
  });

  it("has proper responsive design classes", () => {
    const summaries = ["Test summary"];

    render(<MonthlyTextSummary summaries={summaries} />);

    // Check main container has responsive classes
    const mainContainer = screen
      .getByText("Resumen Mensual")
      .closest(".bg-white");
    expect(mainContainer).toHaveClass(
      "rounded-lg",
      "shadow-sm",
      "border",
      "border-gray-200",
      "p-6"
    );

    // Check summaries container has proper spacing
    const summariesContainer = screen
      .getByText("Test summary")
      .closest(".space-y-3");
    expect(summariesContainer).toBeInTheDocument();
  });

  it("shows correct plural/singular text for month count", () => {
    // Test singular (1 month) - should not show footer
    const singleSummary = [
      "En enero ingresaste $3,000, gastaste $2,500, sobrante $500",
    ];
    const { rerender } = render(
      <MonthlyTextSummary summaries={singleSummary} />
    );
    expect(screen.queryByText(/mostrando \d+ mes/i)).not.toBeInTheDocument();

    // Test plural (2 months)
    const multipleSummaries = [
      "En enero ingresaste $3,000, gastaste $2,500, sobrante $500",
      "En febrero ingresaste $3,200, gastaste $2,800, sobrante $400",
    ];
    rerender(<MonthlyTextSummary summaries={multipleSummaries} />);
    expect(
      screen.getByText("Mostrando 2 meses de actividad financiera")
    ).toBeInTheDocument();
  });

  it("handles very long summary text", () => {
    const longSummary = [
      "En enero ingresaste $3,000.50 de múltiples fuentes incluyendo salario, bonificaciones y ingresos adicionales, gastaste $2,500.75 en diversas categorías como alimentación, transporte, entretenimiento y gastos varios, resultando en un sobrante de $499.75 que representa ahorros positivos para este período",
    ];

    render(<MonthlyTextSummary summaries={longSummary} />);

    expect(screen.getByText(longSummary[0])).toBeInTheDocument();

    // Check that the text has proper line height for readability
    const textElement = screen.getByText(longSummary[0]);
    expect(textElement).toHaveClass("leading-relaxed");
  });

  it("maintains accessibility with proper heading structure", () => {
    const summaries = ["Test summary"];

    render(<MonthlyTextSummary summaries={summaries} />);

    // Check that the title is properly structured as a heading
    const heading = screen.getByRole("heading", { level: 3 });
    expect(heading).toHaveTextContent("Resumen Mensual");
    expect(heading).toHaveClass("text-lg", "font-semibold", "text-gray-900");
  });

  it("handles empty strings in summaries array", () => {
    const summaries = [
      "En enero ingresaste $3,000, gastaste $2,500, sobrante $500",
      "", // Empty string
      "En marzo ingresaste $2,800, gastaste $3,000, déficit $200",
    ];

    render(<MonthlyTextSummary summaries={summaries} />);

    // Should render all summaries including empty ones
    expect(
      screen.getByText("Mostrando 3 meses de actividad financiera")
    ).toBeInTheDocument();

    // Empty summary should still create a container
    const summaryContainers = document.querySelectorAll(".p-4.bg-gray-50");
    expect(summaryContainers).toHaveLength(3);
  });
});
