import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useExpenseTracker } from "../useExpenseTracker";
import { CsvService, AnalysisService, VizService } from "../../services";

// Mock the services
vi.mock("../../services", () => ({
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

describe("useExpenseTracker - Error Handling", () => {
  const mockCsvService = CsvService as any;
  const mockAnalysisService = AnalysisService as any;
  const mockVizService = VizService as any;

  const mockTransactions = [
    {
      Date: "2024-01-15",
      Description: "Grocery Store",
      Type: "Debit Card",
      Amount: -50.0,
      "Current balance": 1000.0,
      Status: "Posted",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Enhanced Error Messages", () => {
    it("should provide user-friendly error messages for file too large", async () => {
      const largeFile = new File(["test"], "test.csv", { type: "text/csv" });
      // Mock file size to be larger than 20MB
      Object.defineProperty(largeFile, "size", { value: 25 * 1024 * 1024 });

      mockCsvService.validateAndParse.mockResolvedValue({
        isValid: false,
        errors: [
          {
            type: "file_too_large",
            message:
              "El archivo es demasiado grande (25.0 MB). Máximo permitido: 20 MB.",
          },
        ],
        metadata: {
          rowCount: 0,
          dateRange: { start: "", end: "" },
          balanceSource: "original",
        },
      });

      const { result } = renderHook(() => useExpenseTracker());

      await act(async () => {
        await result.current.processCSVFile(largeFile);
      });

      expect(result.current.validationResult?.errors?.[0].message).toContain(
        "25.0 MB"
      );
      expect(result.current.validationResult?.errors?.[0].examples).toContain(
        "Divide el archivo en períodos más pequeños (por ejemplo, por trimestre)"
      );
    });

    it("should provide recovery suggestions for missing columns", async () => {
      mockCsvService.validateAndParse.mockResolvedValue({
        isValid: false,
        errors: [
          {
            type: "missing_columns",
            message: "Faltan columnas requeridas: Date, Amount",
            examples: ["Date", "Amount"],
          },
        ],
        metadata: {
          rowCount: 0,
          dateRange: { start: "", end: "" },
          balanceSource: "original",
        },
      });

      const { result } = renderHook(() => useExpenseTracker());
      const mockFile = new File(["invalid,data"], "test.csv", {
        type: "text/csv",
      });

      await act(async () => {
        await result.current.processCSVFile(mockFile);
      });

      const error = result.current.validationResult?.errors?.[0];
      expect(error?.examples).toContain(
        "Verifica que el archivo incluya: Date, Description, Type, Amount, Current balance, Status"
      );
      expect(error?.examples).toContain(
        "Asegúrate de exportar todas las columnas desde tu banco"
      );
    });

    it("should provide specific guidance for invalid date formats", async () => {
      mockCsvService.validateAndParse.mockResolvedValue({
        isValid: false,
        errors: [
          {
            type: "invalid_date",
            message: "Formato de fecha inválido en 3 filas",
            examples: ["fila 2", "fila 5", "fila 8"],
          },
        ],
        metadata: {
          rowCount: 0,
          dateRange: { start: "", end: "" },
          balanceSource: "original",
        },
      });

      const { result } = renderHook(() => useExpenseTracker());
      const mockFile = new File(["test,data"], "test.csv", {
        type: "text/csv",
      });

      await act(async () => {
        await result.current.processCSVFile(mockFile);
      });

      const error = result.current.validationResult?.errors?.[0];
      expect(error?.examples).toContain(
        "Las fechas deben estar en formato MM/DD/YYYY o YYYY-MM-DD"
      );
      expect(error?.examples).toContain(
        "Verifica que no haya celdas vacías en la columna Date"
      );
    });

    it("should provide guidance for invalid amounts", async () => {
      mockCsvService.validateAndParse.mockResolvedValue({
        isValid: false,
        errors: [
          {
            type: "invalid_amount",
            message: "Montos no numéricos encontrados en 2 filas",
            examples: ["fila 3", "fila 7"],
          },
        ],
        metadata: {
          rowCount: 0,
          dateRange: { start: "", end: "" },
          balanceSource: "original",
        },
      });

      const { result } = renderHook(() => useExpenseTracker());
      const mockFile = new File(["test,data"], "test.csv", {
        type: "text/csv",
      });

      await act(async () => {
        await result.current.processCSVFile(mockFile);
      });

      const error = result.current.validationResult?.errors?.[0];
      expect(error?.examples).toContain(
        "Los montos deben ser números (ej: 150.50, -25.00)"
      );
      expect(error?.examples).toContain(
        "Elimina símbolos de moneda ($) si están presentes"
      );
    });
  });

  describe("Error Categorization", () => {
    it("should distinguish between blocking errors and warnings", async () => {
      mockCsvService.validateAndParse.mockResolvedValue({
        isValid: false,
        transactions: mockTransactions, // Has some valid data
        errors: [
          {
            type: "invalid_date",
            message: "Formato de fecha inválido en 2 filas",
          },
        ],
        warnings: ["Balance calculado sintéticamente"],
        metadata: {
          rowCount: 1,
          dateRange: { start: "2024-01-15", end: "2024-01-15" },
          balanceSource: "calculated",
        },
      });

      const mockAnalysisInstance = {
        calculateMonthlySummary: vi.fn().mockReturnValue([]),
        calculateOverallSummary: vi.fn().mockReturnValue({}),
        generateBalanceHistory: vi.fn().mockReturnValue([]),
        groupByTransactionType: vi.fn().mockReturnValue([]),
      };
      mockAnalysisService.mockImplementation(() => mockAnalysisInstance);

      const mockVizInstance = {
        generateTextualSummary: vi.fn().mockReturnValue([]),
      };
      mockVizService.mockImplementation(() => mockVizInstance);

      const { result } = renderHook(() => useExpenseTracker());
      const mockFile = new File(["test,data"], "test.csv", {
        type: "text/csv",
      });

      await act(async () => {
        await result.current.processCSVFile(mockFile);
      });

      // Should proceed with processing despite date errors since we have valid transactions
      expect(result.current.validationResult?.isValid).toBe(true);
      expect(result.current.transactions).toEqual(mockTransactions);
      expect(result.current.validationResult?.warnings).toContain(
        "Advertencia: Formato de fecha inválido en 2 filas"
      );
    });

    it("should treat errors as blocking when no valid transactions exist", async () => {
      mockCsvService.validateAndParse.mockResolvedValue({
        isValid: false,
        transactions: [], // No valid data
        errors: [
          {
            type: "invalid_date",
            message: "Formato de fecha inválido en todas las filas",
          },
        ],
        metadata: {
          rowCount: 0,
          dateRange: { start: "", end: "" },
          balanceSource: "original",
        },
      });

      const { result } = renderHook(() => useExpenseTracker());
      const mockFile = new File(["test,data"], "test.csv", {
        type: "text/csv",
      });

      await act(async () => {
        await result.current.processCSVFile(mockFile);
      });

      // Should not proceed with processing
      expect(result.current.validationResult?.isValid).toBe(false);
      expect(result.current.transactions).toEqual([]);
    });
  });

  describe("Analysis Error Handling", () => {
    it("should handle analysis service errors gracefully", async () => {
      mockCsvService.validateAndParse.mockResolvedValue({
        isValid: true,
        transactions: mockTransactions,
        metadata: {
          rowCount: 1,
          dateRange: { start: "2024-01-15", end: "2024-01-15" },
          balanceSource: "original",
        },
      });

      const mockAnalysisInstance = {
        calculateMonthlySummary: vi.fn().mockImplementation(() => {
          throw new Error("Analysis calculation failed");
        }),
        calculateOverallSummary: vi.fn().mockReturnValue({}),
        generateBalanceHistory: vi.fn().mockReturnValue([]),
        groupByTransactionType: vi.fn().mockReturnValue([]),
      };
      mockAnalysisService.mockImplementation(() => mockAnalysisInstance);

      const { result } = renderHook(() => useExpenseTracker());
      const mockFile = new File(["test,data"], "test.csv", {
        type: "text/csv",
      });

      await act(async () => {
        await result.current.processCSVFile(mockFile);
      });

      // Should keep transaction data even if analysis fails
      expect(result.current.transactions).toEqual(mockTransactions);
      expect(result.current.validationResult?.warnings).toContain(
        "Error durante el análisis de datos: Analysis calculation failed. Los datos básicos están disponibles pero algunos gráficos pueden no funcionar correctamente."
      );
    });
  });

  describe("Network and System Error Handling", () => {
    it("should handle network errors with specific guidance", async () => {
      mockCsvService.validateAndParse.mockRejectedValue(
        new Error("NetworkError: Failed to fetch")
      );

      const { result } = renderHook(() => useExpenseTracker());
      const mockFile = new File(["test,data"], "test.csv", {
        type: "text/csv",
      });

      await act(async () => {
        await result.current.processCSVFile(mockFile);
      });

      expect(result.current.validationResult?.errors?.[0].message).toContain(
        "Error de conexión al procesar el archivo"
      );
      expect(result.current.validationResult?.errors?.[0].examples).toContain(
        "Revisa tu conexión"
      );
    });

    it("should handle memory errors with file size guidance", async () => {
      mockCsvService.validateAndParse.mockRejectedValue(
        new Error("Memory allocation failed")
      );

      const { result } = renderHook(() => useExpenseTracker());
      const mockFile = new File(["test,data"], "test.csv", {
        type: "text/csv",
      });

      await act(async () => {
        await result.current.processCSVFile(mockFile);
      });

      expect(result.current.validationResult?.errors?.[0].type).toBe(
        "file_too_large"
      );
      expect(result.current.validationResult?.errors?.[0].examples).toContain(
        "Divide el archivo por meses"
      );
    });

    it("should handle timeout errors with performance guidance", async () => {
      mockCsvService.validateAndParse.mockRejectedValue(
        new Error("Request timeout")
      );

      const { result } = renderHook(() => useExpenseTracker());
      const mockFile = new File(["test,data"], "test.csv", {
        type: "text/csv",
      });

      await act(async () => {
        await result.current.processCSVFile(mockFile);
      });

      expect(result.current.validationResult?.errors?.[0].message).toContain(
        "El procesamiento del archivo tomó demasiado tiempo"
      );
      expect(result.current.validationResult?.errors?.[0].examples).toContain(
        "Reduce el número de transacciones"
      );
    });
  });

  describe("Recovery Suggestions", () => {
    it("should provide actionable recovery suggestions for each error type", async () => {
      const testCases = [
        {
          errorType: "missing_columns" as const,
          expectedSuggestions: [
            "Verifica que el archivo incluya: Date, Description, Type, Amount, Current balance, Status",
            "Asegúrate de exportar todas las columnas desde tu banco",
          ],
        },
        {
          errorType: "invalid_date" as const,
          expectedSuggestions: [
            "Las fechas deben estar en formato MM/DD/YYYY o YYYY-MM-DD",
            "Verifica que no haya celdas vacías en la columna Date",
          ],
        },
        {
          errorType: "invalid_amount" as const,
          expectedSuggestions: [
            "Los montos deben ser números (ej: 150.50, -25.00)",
            "Elimina símbolos de moneda ($) si están presentes",
          ],
        },
      ];

      for (const testCase of testCases) {
        mockCsvService.validateAndParse.mockResolvedValue({
          isValid: false,
          errors: [
            {
              type: testCase.errorType,
              message: `Test error for ${testCase.errorType}`,
            },
          ],
          metadata: {
            rowCount: 0,
            dateRange: { start: "", end: "" },
            balanceSource: "original",
          },
        });

        const { result } = renderHook(() => useExpenseTracker());
        const mockFile = new File(["test,data"], "test.csv", {
          type: "text/csv",
        });

        await act(async () => {
          await result.current.processCSVFile(mockFile);
        });

        const error = result.current.validationResult?.errors?.[0];
        testCase.expectedSuggestions.forEach((suggestion) => {
          expect(error?.examples).toContain(suggestion);
        });
      }
    });
  });
});
