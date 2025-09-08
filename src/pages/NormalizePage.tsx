import React from "react";
import { Link } from "@tanstack/react-router";
import { TransactionTable } from "../expense-tracker/components";
import { useExpenseTracker } from "../expense-tracker/hooks";

export function NormalizePage() {
  const { transactions, summary, validationResult } = useExpenseTracker();

  const hasData = transactions.length > 0;

  if (!hasData) {
    return (
      <div className="max-w-4xl mx-auto text-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8">
          <div className="text-yellow-600 text-6xl mb-4">📋</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            No hay datos para validar
          </h1>
          <p className="text-gray-600 mb-6">
            Primero necesitas importar un archivo CSV con tus transacciones.
          </p>
          <Link
            to="/import"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Importar archivo CSV
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Validar y Normalizar Datos
        </h1>
        <p className="text-gray-600">
          Revisa tus transacciones normalizadas y verifica que los datos sean
          correctos
        </p>
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-sm font-medium text-gray-500">
              Transacciones
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {transactions.length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-sm font-medium text-gray-500">Ingresos</div>
            <div className="text-2xl font-bold text-green-600">
              +$
              {summary.totalIncome.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-sm font-medium text-gray-500">Gastos</div>
            <div className="text-2xl font-bold text-red-600">
              -$
              {Math.abs(summary.totalExpenses).toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-sm font-medium text-gray-500">Balance</div>
            <div
              className={`text-2xl font-bold ${
                summary.netSavings >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {summary.netSavings >= 0 ? "+" : ""}$
              {summary.netSavings.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </div>
          </div>
        </div>
      )}

      {/* Validation Warnings */}
      {validationResult &&
        validationResult.warnings &&
        validationResult.warnings.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <div className="text-yellow-600 text-lg mr-3">⚠️</div>
              <div className="flex-1">
                <h4 className="font-medium text-yellow-800 mb-2">
                  Advertencias de validación
                </h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {validationResult.warnings.map((warning, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-yellow-500 mr-2">•</span>
                      <span>{warning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

      {/* Balance Source Badge */}
      {summary && summary.balanceSource === "calculated" && (
        <div className="mb-6">
          <div className="inline-flex items-center bg-orange-100 text-orange-800 text-sm font-medium px-3 py-1 rounded-full">
            <span className="mr-2">🧮</span>
            Balance calculado sintéticamente
          </div>
        </div>
      )}

      {/* Transaction Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Transacciones Normalizadas
          </h2>
          <div className="text-sm text-gray-500">
            {summary?.dateRange.start} - {summary?.dateRange.end}
          </div>
        </div>
        <TransactionTable
          transactions={transactions}
          summary={summary!}
          dateRange={summary!.dateRange}
        />
      </div>

      {/* Next Steps */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Siguientes pasos
        </h3>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/analyze"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Analizar datos →
          </Link>
          <Link
            to="/visualize"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Ver visualizaciones →
          </Link>
          <Link
            to="/import"
            className="text-gray-600 hover:text-gray-800 px-4 py-2 border border-gray-300 rounded-lg transition-colors"
          >
            Cargar otro archivo
          </Link>
        </div>
      </div>
    </div>
  );
}
