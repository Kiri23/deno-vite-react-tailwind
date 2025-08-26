import React, { useState, useRef, useCallback } from "react";
import type { FileUploadProps, ValidationError } from "./types";

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileProcessed,
  onError,
  maxFileSize,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback(
    (file: File): ValidationError[] => {
      const errors: ValidationError[] = [];

      // Check file size
      if (file.size > maxFileSize) {
        errors.push({
          type: "file_too_large",
          message: `El archivo es demasiado grande (${(
            file.size /
            1024 /
            1024
          ).toFixed(1)} MB). Máximo permitido: ${(
            maxFileSize /
            1024 /
            1024
          ).toFixed(0)} MB.`,
          examples: ["Considera dividir el archivo en períodos más pequeños."],
        });
      }

      // Check file type
      if (!file.name.toLowerCase().endsWith(".csv")) {
        errors.push({
          type: "missing_columns",
          message: "Por favor selecciona un archivo CSV válido",
          examples: ["El archivo debe tener extensión .csv"],
        });
      }

      // Check if file is empty
      if (file.size === 0) {
        errors.push({
          type: "missing_columns",
          message: "El archivo CSV está vacío",
          examples: [
            "Selecciona un archivo que contenga datos de transacciones",
          ],
        });
      }

      return errors;
    },
    [maxFileSize]
  );

  const processFile = useCallback(
    async (file: File) => {
      const validationErrors = validateFile(file);
      if (validationErrors.length > 0) {
        onError(validationErrors);
        return;
      }

      setIsProcessing(true);
      setProcessingStatus("Leyendo archivo...");

      try {
        // Read file content
        const text = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = () => reject(new Error("Error al leer el archivo"));
          reader.readAsText(file);
        });

        setProcessingStatus("Validando formato CSV...");

        // Basic CSV validation - check if it has content
        if (!text.trim()) {
          onError([
            {
              type: "missing_columns",
              message: "El archivo CSV está vacío",
              examples: [
                "Selecciona un archivo que contenga datos de transacciones",
              ],
            },
          ]);
          return;
        }

        // Parse CSV headers to check required columns
        const lines = text.trim().split("\n");
        if (lines.length < 2) {
          onError([
            {
              type: "missing_columns",
              message:
                "El archivo CSV debe contener al menos una fila de encabezados y una fila de datos",
              examples: ["Verifica que el archivo tenga el formato correcto"],
            },
          ]);
          return;
        }

        const headers = lines[0]
          .split(",")
          .map((h) => h.trim().replace(/"/g, ""));
        const requiredColumns = [
          "Date",
          "Description",
          "Type",
          "Amount",
          "Current balance",
          "Status",
        ];
        const missingColumns = requiredColumns.filter(
          (col) =>
            !headers.some(
              (header) => header.toLowerCase() === col.toLowerCase()
            )
        );

        if (missingColumns.length > 0) {
          onError([
            {
              type: "missing_columns",
              message: `Faltan columnas requeridas: ${missingColumns.join(
                ", "
              )}`,
              examples: [
                `Columnas encontradas: ${headers.join(", ")}`,
                `Columnas requeridas: ${requiredColumns.join(", ")}`,
              ],
            },
          ]);
          return;
        }

        setProcessingStatus("Procesando transacciones...");

        // Parse CSV data (simplified parsing for now)
        const transactions: any[] = [];
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const values = line.split(",").map((v) => v.trim().replace(/"/g, ""));
          if (values.length !== headers.length) continue;

          const transaction: any = {};
          headers.forEach((header, index) => {
            transaction[header] = values[index];
          });

          // Basic validation
          if (!transaction.Date || !transaction.Amount) continue;

          // Convert amount to number
          const amount = parseFloat(transaction.Amount);
          if (isNaN(amount)) continue;

          transaction.Amount = amount;

          // Convert balance to number
          const balance = parseFloat(transaction["Current balance"]);
          if (!isNaN(balance)) {
            transaction["Current balance"] = balance;
          }

          transactions.push(transaction);
        }

        if (transactions.length === 0) {
          onError([
            {
              type: "invalid_amount",
              message: "No se encontraron transacciones válidas en el archivo",
              examples: [
                "Verifica que las columnas Date y Amount contengan datos válidos",
              ],
            },
          ]);
          return;
        }

        setProcessingStatus("Finalizando...");

        // Calculate date range
        const dates = transactions
          .map((t) => new Date(t.Date))
          .filter((d) => !isNaN(d.getTime()))
          .sort((a, b) => a.getTime() - b.getTime());

        const dateRange =
          dates.length > 0
            ? {
                start: dates[0].toISOString().split("T")[0],
                end: dates[dates.length - 1].toISOString().split("T")[0],
              }
            : { start: "", end: "" };

        // Create validation result
        const result = {
          isValid: true,
          transactions,
          errors: [],
          warnings: [],
          metadata: {
            rowCount: transactions.length,
            dateRange,
            balanceSource: "original" as const,
          },
        };

        onFileProcessed(result);
      } catch (error) {
        onError([
          {
            type: "missing_columns",
            message: `Error al procesar el archivo CSV: ${
              error instanceof Error ? error.message : "Error desconocido"
            }`,
            examples: ["Verifica que el archivo tenga el formato CSV correcto"],
          },
        ]);
      } finally {
        setIsProcessing(false);
        setProcessingStatus("");
      }
    },
    [validateFile, onFileProcessed, onError]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        processFile(files[0]);
      }
    },
    [processFile]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        processFile(files[0]);
      }
    },
    [processFile]
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleClick();
      }
    },
    [handleClick]
  );

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200 ease-in-out
          ${
            isDragOver
              ? "border-blue-400 bg-blue-50"
              : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
          }
          ${isProcessing ? "pointer-events-none opacity-75" : ""}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label="Seleccionar archivo CSV de transacciones"
        aria-describedby="file-upload-description"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
          aria-hidden="true"
        />

        {isProcessing ? (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <div>
              <p className="text-lg font-medium text-gray-900">
                Procesando archivo...
              </p>
              {processingStatus && (
                <p className="text-sm text-gray-600 mt-1">{processingStatus}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                className="w-full h-full"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900">
                Arrastra tu archivo CSV aquí
              </p>
              <p
                className="text-sm text-gray-600 mt-1"
                id="file-upload-description"
              >
                o haz clic para seleccionar un archivo
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Máximo {(maxFileSize / 1024 / 1024).toFixed(0)} MB • Formato CSV
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p className="font-medium mb-2">
          El archivo CSV debe contener estas columnas:
        </p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>Date - Fecha de la transacción</li>
          <li>Description - Descripción de la transacción</li>
          <li>Type - Tipo de transacción (Debit Card, Withdrawal, etc.)</li>
          <li>Amount - Monto de la transacción</li>
          <li>Current balance - Balance actual de la cuenta</li>
          <li>Status - Estado de la transacción (Posted, Pending)</li>
        </ul>
      </div>
    </div>
  );
};
