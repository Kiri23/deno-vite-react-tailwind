import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ExpenseTracker } from "../ExpenseTracker";

// Mock the services
vi.mock("../services", () => ({
  CsvService: {
    validateAndParse: vi.fn(),
  },
  AnalysisService: vi.fn().mockImplementation(() => ({
    calculateMonthlySummary: vi.fn(),
    calculateOverallSummary: vi.fn(),
    generateBalanceHistory: vi.fn(),
    groupByTransactionType: vi.fn(),
  })),
  VizService: vi.fn().mockImplementation(() => ({
    generateTextualSummary: vi.fn(),
  })),
}));

// Mock the components to focus on accessibility
vi.mock("../components", () => ({
  FileUpload: ({
    onFileProcessed,
  }: {
    onFileProcessed: (file: File) => void;
  }) => (
    <div data-testid="file-upload">
      <button
        onClick={() => {
          const mockFile = new File(["test"], "test.csv", { type: "text/csv" });
          onFileProcessed(mockFile);
        }}
      >
        Upload File
      </button>
    </div>
  ),
  TransactionTable: ({ transactions }: { transactions: any[] }) => (
    <div
      data-testid="transaction-table"
      role="table"
      aria-label="Tabla de transacciones"
    >
      {transactions.length} transactions
    </div>
  ),
  ExpenseCharts: ({
    showCurrentMonth,
    onToggleCurrentMonth,
  }: {
    showCurrentMonth: boolean;
    onToggleCurrentMonth: (show: boolean) => void;
  }) => (
    <div
      data-testid="expense-charts"
      role="img"
      aria-label="Gráficos de gastos"
    >
      <button onClick={() => onToggleCurrentMonth(!showCurrentMonth)}>
        Toggle Current Month
      </button>
      Current month: {showCurrentMonth ? "shown" : "hidden"}
    </div>
  ),
  MonthlyTextSummary: ({ summaries }: { summaries: string[] }) => (
    <div
      data-testid="monthly-summary"
      role="region"
      aria-label="Resumen mensual"
    >
      {summaries.length} summaries
    </div>
  ),
}));

describe("ExpenseTracker Accessibility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("has proper heading hierarchy", () => {
    render(<ExpenseTracker />);

    // Main heading should be h1
    const mainHeading = screen.getByRole("heading", { level: 1 });
    expect(mainHeading).toHaveTextContent("Seguimiento de Gastos");

    // Section headings should be h2
    const uploadHeading = screen.getByRole("heading", { level: 2 });
    expect(uploadHeading).toHaveTextContent("Cargar archivo CSV");
  });

  it("provides skip to main content link", () => {
    render(<ExpenseTracker />);

    const skipLink = screen.getByText("Saltar al contenido principal");
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute("href", "#main-content");
  });

  it("has proper landmark roles", () => {
    render(<ExpenseTracker />);

    // Should have header landmark
    const header = screen.getByRole("banner");
    expect(header).toBeInTheDocument();

    // Should have main landmark
    const main = screen.getByRole("main");
    expect(main).toBeInTheDocument();
    expect(main).toHaveAttribute("id", "main-content");
  });

  it("provides proper ARIA labels and descriptions", async () => {
    const { CsvService, AnalysisService, VizService } = await import(
      "../services"
    );

    const mockTransactions = [
      {
        Date: "2024-01-15",
        Description: "Test transaction",
        Type: "Debit Card",
        Amount: -50.0,
        "Current balance": 1000.0,
        Status: "Posted",
      },
    ];

    const mockMonthlyData = [
      {
        month: "2024-01",
        totalIncome: 0,
        totalExpenses: 50,
        savings: -50,
        transactionCount: 1,
        isCurrentMonth: true,
      },
    ];

    (CsvService.validateAndParse as any).mockResolvedValue({
      isValid: true,
      transactions: mockTransactions,
      metadata: {
        rowCount: 1,
        dateRange: { start: "2024-01-15", end: "2024-01-15" },
        balanceSource: "calculated",
      },
    });

    const mockAnalysisService = {
      calculateMonthlySummary: vi.fn().mockReturnValue(mockMonthlyData),
      calculateOverallSummary: vi.fn().mockReturnValue({
        totalIncome: 0,
        totalExpenses: 50,
        netSavings: -50,
        transactionCount: 1,
        dateRange: { start: "2024-01-15", end: "2024-01-15" },
        balanceSource: "calculated",
      }),
      generateBalanceHistory: vi.fn().mockReturnValue([]),
      groupByTransactionType: vi.fn().mockReturnValue([]),
    };

    const mockVizService = {
      generateTextualSummary: vi
        .fn()
        .mockReturnValue(["En enero gastaste $50"]),
    };

    (AnalysisService as any).mockImplementation(() => mockAnalysisService);
    (VizService as any).mockImplementation(() => mockVizService);

    render(<ExpenseTracker />);

    const uploadButton = screen.getByText("Upload File");
    fireEvent.click(uploadButton);

    // Wait for data to load and check ARIA labels
    await screen.findByText("Balance calculado");

    // Balance badge should have proper ARIA label
    const balanceBadges = screen.getAllByRole("status");
    const balanceBadge = balanceBadges.find((badge) =>
      badge
        .getAttribute("aria-label")
        ?.includes("Balance calculado sintéticamente")
    );
    expect(balanceBadge).toBeDefined();
    expect(balanceBadge).toHaveAttribute(
      "aria-label",
      expect.stringContaining("Balance calculado sintéticamente")
    );

    // Current month toggle should have proper ARIA attributes
    const toggleSwitch = screen.getByRole("switch");
    expect(toggleSwitch).toHaveAttribute("aria-checked");
    expect(toggleSwitch).toHaveAttribute(
      "aria-labelledby",
      "current-month-label"
    );
    expect(toggleSwitch).toHaveAttribute(
      "aria-describedby",
      "current-month-description"
    );
  });

  it("supports keyboard navigation", async () => {
    const { CsvService, AnalysisService, VizService } = await import(
      "../services"
    );

    const mockTransactions = [
      {
        Date: "2024-01-15",
        Description: "Test transaction",
        Type: "Debit Card",
        Amount: -50.0,
        "Current balance": 1000.0,
        Status: "Posted",
      },
    ];

    const mockMonthlyData = [
      {
        month: "2024-01",
        totalIncome: 0,
        totalExpenses: 50,
        savings: -50,
        transactionCount: 1,
        isCurrentMonth: true,
      },
    ];

    (CsvService.validateAndParse as any).mockResolvedValue({
      isValid: true,
      transactions: mockTransactions,
      metadata: {
        rowCount: 1,
        dateRange: { start: "2024-01-15", end: "2024-01-15" },
        balanceSource: "original",
      },
    });

    const mockAnalysisService = {
      calculateMonthlySummary: vi.fn().mockReturnValue(mockMonthlyData),
      calculateOverallSummary: vi.fn().mockReturnValue({
        totalIncome: 0,
        totalExpenses: 50,
        netSavings: -50,
        transactionCount: 1,
        dateRange: { start: "2024-01-15", end: "2024-01-15" },
        balanceSource: "original",
      }),
      generateBalanceHistory: vi.fn().mockReturnValue([]),
      groupByTransactionType: vi.fn().mockReturnValue([]),
    };

    const mockVizService = {
      generateTextualSummary: vi.fn().mockReturnValue([]),
    };

    (AnalysisService as any).mockImplementation(() => mockAnalysisService);
    (VizService as any).mockImplementation(() => mockVizService);

    render(<ExpenseTracker />);

    const uploadButton = screen.getByText("Upload File");
    fireEvent.click(uploadButton);

    await screen.findByText("Incluir mes actual");

    // Test keyboard navigation on toggle switch
    const toggleSwitch = screen.getByRole("switch");

    // Should be focusable
    toggleSwitch.focus();
    expect(document.activeElement).toBe(toggleSwitch);

    // Should respond to Enter key
    fireEvent.keyDown(toggleSwitch, { key: "Enter" });
    expect(screen.getByText("Mes incompleto")).toBeInTheDocument();

    // Should respond to Space key
    fireEvent.keyDown(toggleSwitch, { key: " " });
    expect(screen.queryByText("Mes incompleto")).not.toBeInTheDocument();
  });

  it("provides proper focus management", () => {
    render(<ExpenseTracker />);

    // Clear data button should have proper focus styles
    const clearButton = screen.queryByText("Limpiar datos");
    if (clearButton) {
      expect(clearButton).toHaveClass(
        "focus:outline-none",
        "focus:ring-2",
        "focus:ring-blue-500"
      );
    }

    // Skip link should be focusable
    const skipLink = screen.getByText("Saltar al contenido principal");
    expect(skipLink).toHaveClass("focus:not-sr-only");
  });

  it("provides live regions for dynamic content", async () => {
    const { CsvService } = await import("../services");

    (CsvService.validateAndParse as any).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(<ExpenseTracker />);

    const uploadButton = screen.getByText("Upload File");
    fireEvent.click(uploadButton);

    // Loading state should have live region
    const loadingStatus = screen.getByRole("status");
    expect(loadingStatus).toHaveAttribute("aria-live", "polite");
    expect(loadingStatus).toHaveAttribute("aria-label", "Cargando contenido");
  });

  it("handles error states with proper ARIA roles", async () => {
    const { CsvService } = await import("../services");

    (CsvService.validateAndParse as any).mockResolvedValue({
      isValid: false,
      errors: [
        {
          type: "missing_columns",
          message: "Faltan columnas requeridas",
          examples: ["Verifica las columnas"],
        },
      ],
      metadata: {
        rowCount: 0,
        dateRange: { start: "", end: "" },
        balanceSource: "original",
      },
    });

    render(<ExpenseTracker />);

    const uploadButton = screen.getByText("Upload File");
    fireEvent.click(uploadButton);

    await screen.findByText("Error al procesar el archivo");

    // Error should have alert role
    const errorAlert = screen.getByRole("alert");
    expect(errorAlert).toHaveAttribute("aria-live", "assertive");
    expect(errorAlert).toBeInTheDocument();
  });

  it("provides proper section labeling", async () => {
    const { CsvService, AnalysisService, VizService } = await import(
      "../services"
    );

    const mockTransactions = [
      {
        Date: "2024-01-15",
        Description: "Test transaction",
        Type: "Debit Card",
        Amount: -50.0,
        "Current balance": 1000.0,
        Status: "Posted",
      },
    ];

    (CsvService.validateAndParse as any).mockResolvedValue({
      isValid: true,
      transactions: mockTransactions,
      metadata: {
        rowCount: 1,
        dateRange: { start: "2024-01-15", end: "2024-01-15" },
        balanceSource: "original",
      },
    });

    const mockAnalysisService = {
      calculateMonthlySummary: vi.fn().mockReturnValue([]),
      calculateOverallSummary: vi.fn().mockReturnValue({
        totalIncome: 0,
        totalExpenses: 50,
        netSavings: -50,
        transactionCount: 1,
        dateRange: { start: "2024-01-15", end: "2024-01-15" },
        balanceSource: "original",
      }),
      generateBalanceHistory: vi.fn().mockReturnValue([]),
      groupByTransactionType: vi.fn().mockReturnValue([]),
    };

    const mockVizService = {
      generateTextualSummary: vi
        .fn()
        .mockReturnValue(["En enero gastaste $50"]),
    };

    (AnalysisService as any).mockImplementation(() => mockAnalysisService);
    (VizService as any).mockImplementation(() => mockVizService);

    render(<ExpenseTracker />);

    const uploadButton = screen.getByText("Upload File");
    fireEvent.click(uploadButton);

    await screen.findByTestId("transaction-table");

    // Sections should have proper aria-labelledby
    const summarySection = screen
      .getByTestId("monthly-summary")
      .closest("section");
    expect(summarySection).toHaveAttribute(
      "aria-labelledby",
      "summary-heading"
    );

    const transactionsSection = screen
      .getByTestId("transaction-table")
      .closest("section");
    expect(transactionsSection).toHaveAttribute(
      "aria-labelledby",
      "transactions-heading"
    );
  });

  it("provides screen reader friendly content", () => {
    render(<ExpenseTracker />);

    // Should have screen reader only content
    const srOnlyElements = document.querySelectorAll(".sr-only");
    expect(srOnlyElements.length).toBeGreaterThan(0);

    // Icons should be hidden from screen readers
    const decorativeIcon = screen.getByText("📊");
    expect(decorativeIcon).toHaveAttribute("aria-hidden", "true");
  });
});
