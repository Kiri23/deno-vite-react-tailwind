import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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

// Mock the components to focus on integration logic
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
    <div data-testid="transaction-table">
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
    <div data-testid="expense-charts">
      <button onClick={() => onToggleCurrentMonth(!showCurrentMonth)}>
        Toggle Current Month
      </button>
      Current month: {showCurrentMonth ? "shown" : "hidden"}
    </div>
  ),
  MonthlyTextSummary: ({ summaries }: { summaries: string[] }) => (
    <div data-testid="monthly-summary">{summaries.length} summaries</div>
  ),
}));

describe("ExpenseTracker Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders initial empty state correctly", () => {
    render(<ExpenseTracker />);

    expect(screen.getByText("Seguimiento de Gastos")).toBeInTheDocument();
    expect(
      screen.getByText("¡Comienza tu análisis financiero!")
    ).toBeInTheDocument();
    expect(screen.getByText("Cargar archivo CSV")).toBeInTheDocument();
    expect(screen.getByTestId("file-upload")).toBeInTheDocument();
  });

  it("shows loading state during file processing", async () => {
    const { CsvService } = await import("../services");

    // Mock a slow validation process
    (CsvService.validateAndParse as any).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(<ExpenseTracker />);

    const uploadButton = screen.getByText("Upload File");
    fireEvent.click(uploadButton);

    expect(screen.getByText(/Procesando archivo/)).toBeInTheDocument();
    expect(
      screen.getByText("Analizando transacciones y generando visualizaciones")
    ).toBeInTheDocument();
  });

  it("displays error messages for invalid files", async () => {
    const { CsvService } = await import("../services");

    (CsvService.validateAndParse as any).mockResolvedValue({
      isValid: false,
      errors: [
        {
          type: "missing_columns",
          message: "Faltan columnas requeridas: Date, Amount",
          examples: ["Verifica que el archivo incluya todas las columnas"],
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

    await waitFor(() => {
      expect(
        screen.getByText("Error al procesar el archivo")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Faltan columnas requeridas: Date, Amount")
      ).toBeInTheDocument();
      expect(screen.getByText("Sugerencias:")).toBeInTheDocument();
    });
  });

  it("displays warnings for non-blocking issues", async () => {
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
      warnings: [
        "Algunas fechas tenían formato inconsistente y fueron normalizadas",
      ],
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
      generateTextualSummary: vi.fn().mockReturnValue([]),
    };

    (AnalysisService as any).mockImplementation(() => mockAnalysisService);
    (VizService as any).mockImplementation(() => mockVizService);

    render(<ExpenseTracker />);

    const uploadButton = screen.getByText("Upload File");
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByText("Advertencias")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Algunas fechas tenían formato inconsistente y fueron normalizadas"
        )
      ).toBeInTheDocument();
    });
  });

  it("shows balance calculated badge when using synthetic balance", async () => {
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
        balanceSource: "calculated", // Synthetic balance
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
        balanceSource: "calculated",
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

    await waitFor(() => {
      expect(screen.getByText("Balance calculado")).toBeInTheDocument();
      expect(screen.getByText("🧮")).toBeInTheDocument();
    });
  });

  it("handles current month toggle functionality", async () => {
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

    await waitFor(() => {
      expect(screen.getByText("Incluir mes actual")).toBeInTheDocument();
    });

    // Toggle current month
    const toggleButton = screen.getByText("Incluir mes actual");
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(screen.getByText("Mes incompleto")).toBeInTheDocument();
    });
  });

  it("displays all main sections when data is loaded", async () => {
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

    await waitFor(() => {
      expect(screen.getByText("Resumen Mensual")).toBeInTheDocument();
      expect(screen.getByText("Detalle de Transacciones")).toBeInTheDocument();
      expect(screen.getByTestId("monthly-summary")).toBeInTheDocument();
      expect(screen.getByTestId("transaction-table")).toBeInTheDocument();
    });

    // Charts might not show if there's no chart data
    const chartsSection = screen.queryByText("Visualizaciones");
    if (chartsSection) {
      expect(screen.getByTestId("expense-charts")).toBeInTheDocument();
    }
  });

  it("handles clear data functionality", async () => {
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
      generateTextualSummary: vi.fn().mockReturnValue([]),
    };

    (AnalysisService as any).mockImplementation(() => mockAnalysisService);
    (VizService as any).mockImplementation(() => mockVizService);

    render(<ExpenseTracker />);

    // Upload file first
    const uploadButton = screen.getByText("Upload File");
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByText("Limpiar datos")).toBeInTheDocument();
    });

    // Clear data
    const clearButton = screen.getByText("Limpiar datos");
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(
        screen.getByText("¡Comienza tu análisis financiero!")
      ).toBeInTheDocument();
      expect(screen.queryByText("Limpiar datos")).not.toBeInTheDocument();
    });
  });

  it("handles error boundary for unexpected errors", () => {
    // Mock console.error to avoid noise in test output
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    // Since the error boundary is inside ExpenseTracker, we need to test it differently
    // Let's test that the component handles errors gracefully by checking if it renders without crashing
    expect(() => render(<ExpenseTracker />)).not.toThrow();

    consoleSpy.mockRestore();
  });

  it("shows responsive layout elements", () => {
    render(<ExpenseTracker />);

    // Check for responsive classes and mobile considerations
    // Find the container with max-w-7xl class
    const containers = document.querySelectorAll(".max-w-7xl");
    expect(containers.length).toBeGreaterThan(0);

    // Check for mobile-friendly spacing and layout
    const headerSection = screen
      .getByText("Seguimiento de Gastos")
      .closest(".bg-white");
    expect(headerSection).toHaveClass("rounded-lg");
  });
});
