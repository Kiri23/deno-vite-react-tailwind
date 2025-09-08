import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ExpenseTracker } from "../ExpenseTracker";
import { AppContextProvider } from "../../app/context";

// Helper function to render ExpenseTracker with required providers
function renderExpenseTracker() {
  return render(
    <AppContextProvider>
      <ExpenseTracker />
    </AppContextProvider>
  );
}

// Mock the services
vi.mock("../services", () => ({
  CsvService: {
    validateAndParse: vi.fn().mockResolvedValue({
      isValid: true,
      transactions: [
        {
          Date: "2024-01-15",
          Description: "Test transaction",
          Type: "Debit Card",
          Amount: -50.0,
          "Current balance": 1000.0,
          Status: "Posted",
        },
      ],
      metadata: {
        rowCount: 1,
        dateRange: { start: "2024-01-15", end: "2024-01-15" },
        balanceSource: "calculated",
      },
    }),
  },
  AnalysisService: vi.fn().mockImplementation(() => ({
    calculateMonthlySummary: vi.fn().mockReturnValue([
      {
        month: "2024-01",
        totalIncome: 0,
        totalExpenses: 50,
        savings: -50,
        transactionCount: 1,
        isCurrentMonth: false,
      },
    ]),
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
  })),
  VizService: vi.fn().mockImplementation(() => ({
    generateTextualSummary: vi.fn().mockReturnValue(["En enero gastaste $50"]),
  })),
  ExpenseAnalysisService: vi.fn().mockImplementation(() => ({
    getAvailableMonths: vi.fn().mockReturnValue([]),
    getDefaultAnalysisMonth: vi.fn().mockReturnValue(null),
    analyzeMonth: vi.fn().mockReturnValue(null),
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
          const csvContent = `Date,Description,Type,Amount,Current balance,Status
2024-01-15,Test transaction,DEBIT CARD,-50.00,1000.00,Posted`;
          const mockFile = new File([csvContent], "test.csv", {
            type: "text/csv",
          });
          onFileProcessed(mockFile);
        }}
      >
        Upload File
      </button>
    </div>
  ),
  TransactionTable: ({ transactions }: { transactions: any[] }) => (
    <section aria-labelledby="transactions-heading">
      <div
        data-testid="transaction-table"
        role="table"
        aria-label="Tabla de transacciones"
      >
        {transactions.length} transactions
      </div>
    </section>
  ),
  ExpenseCharts: ({
    showCurrentMonth,
    onToggleCurrentMonth,
    balanceSource,
  }: {
    showCurrentMonth: boolean;
    onToggleCurrentMonth: (show: boolean) => void;
    balanceSource?: string;
  }) => (
    <div
      data-testid="expense-charts"
      role="img"
      aria-label="Gráficos de gastos"
    >
      <div>
        <label id="current-month-label">Incluir mes actual</label>
        <button
          role="switch"
          aria-checked={showCurrentMonth}
          aria-labelledby="current-month-label"
          aria-describedby="current-month-description"
          onClick={() => onToggleCurrentMonth(!showCurrentMonth)}
        >
          Toggle Current Month
        </button>
        <div id="current-month-description">
          {showCurrentMonth && <span>Mes incompleto</span>}
        </div>
      </div>
      {balanceSource === "calculated" && (
        <div
          role="status"
          aria-label="Balance calculado sintéticamente debido a datos faltantes"
        >
          Balance calculado
        </div>
      )}
      Current month: {showCurrentMonth ? "shown" : "hidden"}
    </div>
  ),
  MonthlyTextSummary: ({ summaries }: { summaries: string[] }) => (
    <section aria-labelledby="summary-heading">
      <div
        data-testid="monthly-summary"
        role="region"
        aria-label="Resumen mensual"
      >
        {summaries.length} summaries
      </div>
    </section>
  ),
}));

describe("ExpenseTracker Accessibility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("has proper heading hierarchy", () => {
    renderExpenseTracker();

    // Main heading should be h1
    const mainHeading = screen.getByRole("heading", { level: 1 });
    expect(mainHeading).toHaveTextContent("Seguimiento de Gastos");

    // Section headings should be h2
    const uploadHeading = screen.getByRole("heading", { level: 2 });
    expect(uploadHeading).toHaveTextContent("Cargar archivo CSV");
  });

  it("provides skip to main content link", () => {
    renderExpenseTracker();

    const skipLink = screen.getByText("Saltar al contenido principal");
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute("href", "#main-content");
  });

  it("has proper landmark roles", () => {
    renderExpenseTracker();

    // Should have header landmark
    const header = screen.getByRole("banner");
    expect(header).toBeInTheDocument();

    // Should have main landmark
    const main = screen.getByRole("main");
    expect(main).toBeInTheDocument();
    expect(main).toHaveAttribute("id", "main-content");
  });

  it("provides proper ARIA labels and descriptions", () => {
    renderExpenseTracker();

    // Check basic ARIA labels that should always be present
    const uploadSection = screen.getByLabelText("Cargar archivo CSV");
    expect(uploadSection).toBeInTheDocument();

    // File upload should have proper labeling
    const fileUpload = screen.getByTestId("file-upload");
    expect(fileUpload).toBeInTheDocument();
  });

  it("supports keyboard navigation", () => {
    renderExpenseTracker();

    // Test that interactive elements are focusable
    const uploadButton = screen.getByText("Upload File");
    expect(uploadButton).toBeInTheDocument();

    // Should be able to focus the upload button
    uploadButton.focus();
    expect(document.activeElement).toBe(uploadButton);
  });

  it("provides proper focus management", () => {
    renderExpenseTracker();

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

    renderExpenseTracker();

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

    renderExpenseTracker();

    const uploadButton = screen.getByText("Upload File");
    fireEvent.click(uploadButton);

    await screen.findByText("Error al procesar el archivo");

    // Error should have alert role
    const errorAlert = screen.getByRole("alert");
    expect(errorAlert).toHaveAttribute("aria-live", "assertive");
    expect(errorAlert).toBeInTheDocument();
  });

  it("provides proper section labeling", () => {
    renderExpenseTracker();

    // Check that sections have proper labeling
    const uploadSection = screen.getByRole("region", {
      name: /cargar archivo csv/i,
    });
    expect(uploadSection).toBeInTheDocument();

    // Upload heading should be properly associated
    const uploadHeading = screen.getByRole("heading", {
      name: /cargar archivo csv/i,
    });
    expect(uploadHeading).toHaveAttribute("id", "upload-heading");
  });

  it("provides screen reader friendly content", () => {
    renderExpenseTracker();

    // Should have screen reader only content
    const srOnlyElements = document.querySelectorAll(".sr-only");
    expect(srOnlyElements.length).toBeGreaterThan(0);

    // Icons should be hidden from screen readers
    const decorativeIcon = screen.getByText("📊");
    expect(decorativeIcon).toHaveAttribute("aria-hidden", "true");
  });
});
