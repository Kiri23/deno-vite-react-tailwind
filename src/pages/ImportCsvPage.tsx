import React, { useCallback, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { FileUpload } from "../expense-tracker/components";
import { useExpenseTracker } from "../expense-tracker/hooks";
import { useUserData } from "../contexts/UserDataContext";

export function ImportCsvPage() {
  const navigate = useNavigate();
  const { addDataset, datasets } = useUserData();
  const [datasetName, setDatasetName] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);
  const [pendingData, setPendingData] = useState<{
    fileName: string;
    transactions: any[];
    monthlyData: any[];
    summary: any;
  } | null>(null);

  const {
    transactions,
    monthlyData,
    summary,
    isLoading,
    validationResult,
    processCSVFile,
    clearData,
  } = useExpenseTracker();

  const handleFileProcessed = useCallback(
    async (file: File) => {
      await processCSVFile(file);

      // After processing, prepare to save as dataset
      if (transactions.length > 0 && summary) {
        setPendingData({
          fileName: file.name,
          transactions,
          monthlyData,
          summary,
        });
        setDatasetName(file.name.replace(".csv", ""));
        setShowNameInput(true);
      }
    },
    [processCSVFile, transactions, monthlyData, summary]
  );

  const handleSaveDataset = useCallback(() => {
    if (pendingData && datasetName.trim()) {
      addDataset(
        datasetName.trim(),
        pendingData.fileName,
        pendingData.transactions,
        pendingData.monthlyData,
        pendingData.summary
      );

      // Clear the form
      setPendingData(null);
      setShowNameInput(false);
      setDatasetName("");
      clearData();

      // Navigate to visualize
      navigate({ to: "/visualize" });
    }
  }, [pendingData, datasetName, addDataset, clearData, navigate]);

  const handleCancelSave = useCallback(() => {
    setPendingData(null);
    setShowNameInput(false);
    setDatasetName("");
    clearData();
  }, [clearData]);

  const hasValidData = transactions.length > 0 && validationResult?.isValid;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Importar Archivo CSV
        </h1>
        <p className="text-gray-600">
          Carga tu archivo CSV de transacciones bancarias para comenzar el
          análisis
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center mb-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            Procesando archivo...
          </h3>
          <p className="text-blue-700">
            Analizando transacciones y validando datos
          </p>
        </div>
      )}

      {/* Error Display */}
      {validationResult &&
        !validationResult.isValid &&
        validationResult.errors && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <div className="flex items-start">
              <div className="text-red-600 text-xl mr-3">❌</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-800 mb-3">
                  Error al procesar el archivo
                </h3>
                {validationResult.errors.map((error, index) => (
                  <div key={index} className="mb-4 last:mb-0">
                    <p className="text-red-700 font-medium mb-2">
                      {error.message}
                    </p>
                    {error.examples && error.examples.length > 0 && (
                      <div className="bg-red-100 rounded p-3">
                        <p className="text-sm font-medium text-red-800 mb-2">
                          Sugerencias:
                        </p>
                        <ul className="text-sm text-red-700 space-y-1">
                          {error.examples.map((example, exampleIndex) => (
                            <li key={exampleIndex} className="flex items-start">
                              <span className="text-red-500 mr-2">•</span>
                              <span>{example}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      {/* Success State with Dataset Naming */}
      {hasValidData && showNameInput && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <div className="flex items-start">
            <div className="text-green-600 text-xl mr-3">✅</div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Archivo procesado exitosamente
              </h3>
              <p className="text-green-700 mb-4">
                Se procesaron {transactions.length} transacciones correctamente.
                Ahora dale un nombre a tu dataset para guardarlo.
              </p>

              <div className="mb-4">
                <label
                  htmlFor="dataset-name"
                  className="block text-sm font-medium text-green-800 mb-2"
                >
                  Nombre del dataset:
                </label>
                <input
                  id="dataset-name"
                  type="text"
                  value={datasetName}
                  onChange={(e) => setDatasetName(e.target.value)}
                  placeholder="Ej: Gastos Enero 2025"
                  className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  autoFocus
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleSaveDataset}
                  disabled={!datasetName.trim()}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Guardar y continuar →
                </button>
                <button
                  onClick={handleCancelSave}
                  className="text-gray-600 hover:text-gray-800 px-4 py-2 border border-gray-300 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Simple success state when not showing name input */}
      {hasValidData && !showNameInput && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <div className="flex items-start">
            <div className="text-green-600 text-xl mr-3">✅</div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Archivo procesado exitosamente
              </h3>
              <p className="text-green-700 mb-4">
                Se procesaron {transactions.length} transacciones correctamente.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setShowNameInput(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Guardar dataset →
                </button>
                <Link
                  to="/validate"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Validar datos →
                </Link>
                <button
                  onClick={clearData}
                  className="text-gray-600 hover:text-gray-800 px-4 py-2 border border-gray-300 rounded-lg transition-colors"
                >
                  Cargar otro archivo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Existing Datasets */}
      {datasets.length > 0 && !hasValidData && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Tus Datasets Existentes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {datasets.map((dataset) => (
              <div
                key={dataset.id}
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md ${
                  dataset.isActive
                    ? "border-blue-200 bg-blue-50"
                    : "border-gray-200 bg-gray-50 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900 truncate">
                    {dataset.name}
                  </h3>
                  {dataset.isActive && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      Activo
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2 truncate">
                  {dataset.fileName}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span>{dataset.transactions.length} transacciones</span>
                  <span>
                    {new Date(dataset.uploadedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Link
                    to="/visualize"
                    className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 px-3 rounded transition-colors"
                  >
                    Ver análisis
                  </Link>
                  <Link
                    to="/validate"
                    className="flex-1 text-center bg-gray-600 hover:bg-gray-700 text-white text-xs py-2 px-3 rounded transition-colors"
                  >
                    Validar
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* File Upload Section */}
      {(!hasValidData || !isLoading) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {hasValidData
              ? "Cargar nuevo archivo"
              : datasets.length > 0
              ? "Agregar nuevo dataset"
              : "Seleccionar archivo CSV"}
          </h2>
          <FileUpload
            onFileProcessed={handleFileProcessed}
            onError={(errors) => {
              console.error("FileUpload errors:", errors);
            }}
            maxFileSize={20 * 1024 * 1024}
          />
        </div>
      )}

      {/* Requirements */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Requisitos del archivo
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">
              Columnas requeridas:
            </h4>
            <ul className="space-y-1">
              <li>• Date (Fecha)</li>
              <li>• Description (Descripción)</li>
              <li>• Type (Tipo)</li>
              <li>• Amount (Monto)</li>
              <li>• Current balance (Balance actual)</li>
              <li>• Status (Estado)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">
              Especificaciones:
            </h4>
            <ul className="space-y-1">
              <li>• Formato: CSV</li>
              <li>• Tamaño máximo: 20 MB</li>
              <li>• Codificación: UTF-8 (recomendado)</li>
              <li>• Separador: coma (,)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
