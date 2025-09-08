import React from "react";
import { FileUpload } from "../expense-tracker/components/FileUpload";
import type {
  ValidationError,
  CsvValidationResult,
} from "../expense-tracker/types";

export interface ImportCsvViewProps {
  onFileUpload: (file: File) => Promise<void>;
  isLoading: boolean;
  validationResult?: CsvValidationResult | null;
  maxFileSize?: number;
}

export function ImportCsvView({
  onFileUpload,
  isLoading,
  validationResult,
  maxFileSize = 20 * 1024 * 1024, // 20MB default
}: ImportCsvViewProps) {
  const handleError = (errors: ValidationError[]) => {
    // Errors are handled through validationResult prop
    console.warn("File upload errors:", errors);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Importar Transacciones
        </h2>
        <p className="text-gray-600 mt-2">
          Sube tu archivo CSV de transacciones bancarias para comenzar el
          análisis
        </p>
      </div>

      {/* File Upload Component */}
      <div className="max-w-2xl mx-auto">
        <FileUpload
          onFileProcessed={onFileUpload}
          onError={handleError}
          maxFileSize={maxFileSize}
        />
      </div>

      {/* Validation Results */}
      {validationResult && (
        <div className="max-w-2xl mx-auto">
          {validationResult.isValid ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Archivo procesado exitosamentesView
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>
                      Se procesaron {validationResult.metadata.rowCount}{" "}
                      transacciones
                    </p>
                    <p>
                      Período: {validationResult.metadata.dateRange.start} -{" "}
                      {validationResult.metadata.dateRange.end}
                    </p>
                    {validationResult.metadata.balanceSource ===
                      "calculated" && (
                      <p className="mt-1 text-yellow-700">
                        ⚠️ Se calculó el balance sintético (algunos valores
                        originales faltaban)
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Warnings */}
              {validationResult.warnings &&
                validationResult.warnings.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <h4 className="text-sm font-medium text-yellow-800">
                      Advertencias:
                    </h4>
                    <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
                      {validationResult.warnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Error al procesar el archivo
                  </h3>
                  {validationResult.errors &&
                    validationResult.errors.length > 0 && (
                      <div className="mt-2">
                        {validationResult.errors.map((error, index) => (
                          <div key={index} className="mb-3">
                            <p className="text-sm text-red-700 font-medium">
                              {error.message}
                            </p>
                            {error.examples && error.examples.length > 0 && (
                              <div className="mt-1">
                                <p className="text-xs text-red-600">
                                  Sugerencias:
                                </p>
                                <ul className="text-xs text-red-600 list-disc list-inside ml-2">
                                  {error.examples.map(
                                    (example, exampleIndex) => (
                                      <li key={exampleIndex}>{example}</li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-800">
                  Procesando archivo...
                </p>
                <p className="text-xs text-blue-600">
                  Esto puede tomar unos momentos para archivos grandes
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            Instrucciones de uso:
          </h3>
          <ol className="text-sm text-gray-700 list-decimal list-inside space-y-1">
            <li>Exporta tus transacciones bancarias en formato CSV</li>
            <li>
              Asegúrate de que el archivo incluya todas las columnas requeridas
            </li>
            <li>Arrastra el archivo aquí o haz clic para seleccionarlo</li>
            <li>Espera a que se complete el procesamiento</li>
            <li>Navega a las otras secciones para ver el análisis</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
