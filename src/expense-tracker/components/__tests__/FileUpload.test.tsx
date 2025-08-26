import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { FileUpload } from "../FileUpload";
import type { CsvValidationResult, ValidationError } from "../types";

// Mock FileReader
const mockFileReader = {
  readAsText: vi.fn(),
  result: "",
  onload: null as ((event: any) => void) | null,
  onerror: null as ((event: any) => void) | null,
};

Object.defineProperty(global, "FileReader", {
  writable: true,
  value: vi.fn(() => mockFileReader),
});

describe("FileUpload", () => {
  const mockOnFileProcessed = vi.fn<[CsvValidationResult], void>();
  const mockOnError = vi.fn<[ValidationError[]], void>();
  const maxFileSize = 20 * 1024 * 1024; // 20MB

  beforeEach(() => {
    vi.clearAllMocks();
    mockFileReader.result = "";
  });

  const defaultProps = {
    onFileProcessed: mockOnFileProcessed,
    onError: mockOnError,
    maxFileSize,
  };

  it("renders file upload interface", () => {
    render(<FileUpload {...defaultProps} />);

    expect(
      screen.getByText("Arrastra tu archivo CSV aquí")
    ).toBeInTheDocument();
    expect(
      screen.getByText("o haz clic para seleccionar un archivo")
    ).toBeInTheDocument();
    expect(screen.getByText("Máximo 20 MB • Formato CSV")).toBeInTheDocument();
  });

  it("shows required columns information", () => {
    render(<FileUpload {...defaultProps} />);

    expect(
      screen.getByText("El archivo CSV debe contener estas columnas:")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Date - Fecha de la transacción")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Amount - Monto de la transacción")
    ).toBeInTheDocument();
  });

  it("handles file size validation", async () => {
    render(<FileUpload {...defaultProps} />);

    const file = new File(["test"], "test.csv", {
      type: "text/csv",
      // Mock a file larger than maxFileSize
    });
    Object.defineProperty(file, "size", { value: maxFileSize + 1 });

    const input = screen.getByRole("button", {
      name: /seleccionar archivo csv/i,
    });
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith([
        expect.objectContaining({
          type: "file_too_large",
          message: expect.stringContaining("El archivo es demasiado grande"),
        }),
      ]);
    });
  });

  it("handles invalid file type", async () => {
    render(<FileUpload {...defaultProps} />);

    const file = new File(["test"], "test.txt", { type: "text/plain" });
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith([
        expect.objectContaining({
          type: "missing_columns",
          message: "Por favor selecciona un archivo CSV válido",
        }),
      ]);
    });
  });

  it("handles empty file", async () => {
    render(<FileUpload {...defaultProps} />);

    const file = new File([""], "test.csv", { type: "text/csv" });
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith([
        expect.objectContaining({
          type: "missing_columns",
          message: "El archivo CSV está vacío",
        }),
      ]);
    });
  });

  it("processes valid CSV file", async () => {
    render(<FileUpload {...defaultProps} />);

    const csvContent = `Date,Description,Type,Amount,Current balance,Status
2024-01-01,Test Transaction,Debit Card,-50.00,1000.00,Posted
2024-01-02,Another Transaction,Deposit,100.00,1100.00,Posted`;

    const file = new File([csvContent], "test.csv", { type: "text/csv" });
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    // Mock FileReader success
    mockFileReader.result = csvContent;

    fireEvent.change(fileInput, { target: { files: [file] } });

    // Simulate FileReader onload
    await waitFor(() => {
      if (mockFileReader.onload) {
        mockFileReader.onload({ target: { result: csvContent } });
      }
    });

    await waitFor(() => {
      expect(mockOnFileProcessed).toHaveBeenCalledWith(
        expect.objectContaining({
          isValid: true,
          transactions: expect.arrayContaining([
            expect.objectContaining({
              Date: "2024-01-01",
              Description: "Test Transaction",
              Type: "Debit Card",
              Amount: -50,
            }),
          ]),
          metadata: expect.objectContaining({
            rowCount: 2,
            dateRange: expect.objectContaining({
              start: expect.any(String),
              end: expect.any(String),
            }),
          }),
        })
      );
    });
  });

  it("handles missing required columns", async () => {
    render(<FileUpload {...defaultProps} />);

    const csvContent = `Date,Description,Amount
2024-01-01,Test Transaction,-50.00`;

    const file = new File([csvContent], "test.csv", { type: "text/csv" });
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    mockFileReader.result = csvContent;

    fireEvent.change(fileInput, { target: { files: [file] } });

    if (mockFileReader.onload) {
      mockFileReader.onload({ target: { result: csvContent } });
    }

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith([
        expect.objectContaining({
          type: "missing_columns",
          message: expect.stringContaining("Faltan columnas requeridas"),
        }),
      ]);
    });
  });

  it("shows loading state during processing", async () => {
    render(<FileUpload {...defaultProps} />);

    const csvContent = `Date,Description,Type,Amount,Current balance,Status
2024-01-01,Test Transaction,Debit Card,-50.00,1000.00,Posted`;

    const file = new File([csvContent], "test.csv", { type: "text/csv" });
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    fireEvent.change(fileInput, { target: { files: [file] } });

    // Should show loading state
    expect(screen.getByText("Procesando archivo...")).toBeInTheDocument();
    expect(screen.getByText("Leyendo archivo...")).toBeInTheDocument();
  });

  it("handles drag and drop", () => {
    render(<FileUpload {...defaultProps} />);

    const dropZone = screen.getByRole("button", {
      name: /seleccionar archivo csv/i,
    });

    // Test drag over
    fireEvent.dragOver(dropZone);
    expect(dropZone).toHaveClass("border-blue-400", "bg-blue-50");

    // Test drag leave
    fireEvent.dragLeave(dropZone);
    expect(dropZone).not.toHaveClass("border-blue-400", "bg-blue-50");
  });

  it("supports keyboard navigation", () => {
    render(<FileUpload {...defaultProps} />);

    const dropZone = screen.getByRole("button", {
      name: /seleccionar archivo csv/i,
    });

    // Should be focusable
    expect(dropZone).toHaveAttribute("tabIndex", "0");

    // Should handle Enter key
    fireEvent.keyDown(dropZone, { key: "Enter" });
    // File input click would be triggered (tested indirectly)

    // Should handle Space key
    fireEvent.keyDown(dropZone, { key: " " });
    // File input click would be triggered (tested indirectly)
  });

  it("has proper accessibility attributes", () => {
    render(<FileUpload {...defaultProps} />);

    const dropZone = screen.getByRole("button", {
      name: /seleccionar archivo csv/i,
    });
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    expect(dropZone).toHaveAttribute(
      "aria-label",
      "Seleccionar archivo CSV de transacciones"
    );
    expect(dropZone).toHaveAttribute(
      "aria-describedby",
      "file-upload-description"
    );
    expect(fileInput).toHaveAttribute("aria-hidden", "true");
  });
});
