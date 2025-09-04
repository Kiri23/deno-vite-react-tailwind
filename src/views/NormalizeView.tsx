import React from "react";
import { TransactionTable } from "../expense-tracker/components/TransactionTable";
import type {
  TransactionData,
  OverallSummary,
  CsvValidationResult,
} from "../expense-tracker/types";

export interface NormalizeViewProps {
  transactions: TransactionData[];
  summary: OverallSummary | null;
  validationResult?: CsvValidationResult | null;
  isLoading?: boolean;
}

export function NormalizeView({
  transactions,
  summary,
  validationResult,
  isLoading = false,
}: NormalizeViewProps) {
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay transacciones para mostrar
          </h3>
          <p className="text-gray-600 mb-4">
            Primero necesitas importar un archivo CSV con tus transacciones
          </p>
          <p className="text-sm text-gray-500">
            Ve a la sección "Importar" para subir tu archivo
          </p>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-red-600 font-medium">Error al procesar datos</p>
          <p className="text-gray-600 text-sm mt-1">
            No se pudo generar el resumen de transacciones
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Datos Normalizados</h2>
        <p className="text-gray-600 mt-2">
          Transacciones procesadas y normalizadas según los estándares del
          sistema
        </p>
      </div>

      {/* Normalization Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Estado de Normalización
            </h3>
            <div className="mt-2 space-y-2">
              <div className="flex items-center text-sm">
                <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-gray-700">
                  Fechas normalizadas a formato YYYY-MM-DD
                </span>
              </div>
              <div className="flex items-center text-sm">
                <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-gray-700">
                  Tipos de transacción estandarizados
                </span>
              </div>
              <div className="flex items-center text-sm">
                <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-gray-700">
                  Montos canonicalizados (positivo = ingreso, negativo = gasto)
                </span>
              </div>
              {summary.balanceSource === "calculated" && (
                <div className="flex items-center text-sm">
                  <div className="flex-shrink-0 w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                  <span className="text-gray-700">
                    Balance calculado sintéticamente (algunos valores originales
                    faltaban)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {transactions.length}
            </div>
            <div className="text-sm text-gray-600">transacciones</div>
            <div className="text-xs text-gray-500 mt-1">
              {summary.dateRange.start} - {summary.dateRange.end}
            </div>
          </div>
        </div>
      </div>

      {/* Validation Warnings */}
      {validationResult?.warnings && validationResult.warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Advertencias de Normalización
              </h3>
              <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
                {validationResult.warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Data Quality Insights */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Calidad de Datos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-sm font-medium text-blue-800">
              Período de Datos
            </div>
            <div className="text-lg font-bold text-blue-900">
              {(() => {
                const start = new Date(summary.dateRange.start);
                const end = new Date(summary.dateRange.end);
                const diffTime = Math.abs(end.getTime() - start.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return `${diffDays} días`;
              })()}
            </div>
            <div className="text-xs text-blue-700">
              {summary.dateRange.start} - {summary.dateRange.end}
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="text-sm font-medium text-green-800">
              Fuente de Balance
            </div>
            <div className="text-lg font-bold text-green-900">
              {summary.balanceSource === "original" ? "Original" : "Calculado"}
            </div>
            <div className="text-xs text-green-700">
              {summary.balanceSource === "original"
                ? "Valores del banco"
                : "Sintético con ancla"}
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <div className="text-sm font-medium text-purple-800">
              Densidad de Datos
            </div>
            <div className="text-lg font-bold text-purple-900">
              {(() => {
                const start = new Date(summary.dateRange.start);
                const end = new Date(summary.dateRange.end);
                const diffTime = Math.abs(end.getTime() - start.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                const density = (transactions.length / diffDays).toFixed(1);
                return `${density}/día`;
              })()}
            </div>
            <div className="text-xs text-purple-700">
              Transacciones promedio por día
            </div>
          </div>
        </div>
      </div>

      {/* Normalization Rules Applied */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Reglas de Normalización Aplicadas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-800 mb-2">
              Tipos de Transacción
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• DEBIT/DBT/Debit Card → Debit Card</li>
              <li>• ATM/Withdrawal → Withdrawal</li>
              <li>• XFER/Transfer → Transfer</li>
              <li>• DEP/Deposit → Deposit</li>
              <li>• Roundup → Roundup</li>
              <li>• Otros → Other (con advertencia)</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-800 mb-2">
              Canonicalización de Montos
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Deposits → siempre positivo</li>
              <li>• Withdrawals/Debits → siempre negativo</li>
              <li>• Transfers → mantener signo original</li>
              <li>• Otros → mantener signo original</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <TransactionTable
        transactions={transactions}
        summary={summary}
        dateRange={summary.dateRange}
      />
    </div>
  );
}
