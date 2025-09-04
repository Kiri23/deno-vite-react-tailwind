import React from "react";
import { TransactionTable } from "../expense-tracker/components/TransactionTable";
import { MonthlyTextSummary } from "../expense-tracker/components/MonthlyTextSummary";
import { ExpenseAnalysis } from "../expense-tracker/components/ExpenseAnalysis";
import { formatCurrency } from "../utils/formatting/currency";
import type {
  TransactionData,
  MonthlyData,
  OverallSummary,
  MonthlyAnalysis,
  AnalysisOptions,
} from "../expense-tracker/types";

export interface AnalyzeViewProps {
  transactions: TransactionData[];
  monthlyData: MonthlyData[];
  summary: OverallSummary | null;
  textualSummaries: string[];
  showCurrentMonth: boolean;
  onToggleCurrentMonth: (show: boolean) => void;
  // Expense Analysis props
  selectedAnalysisMonth?: string | null;
  analysisOptions: AnalysisOptions;
  monthlyAnalysis?: MonthlyAnalysis | null;
  availableAnalysisMonths: string[];
  isAnalysisLoading?: boolean;
  analysisError?: string | null;
  onMonthSelect: (month: string) => void;
  onOptionsChange: (options: AnalysisOptions) => void;
}

export function AnalyzeView({
  transactions,
  monthlyData,
  summary,
  textualSummaries,
  showCurrentMonth,
  onToggleCurrentMonth,
  selectedAnalysisMonth,
  analysisOptions,
  monthlyAnalysis,
  availableAnalysisMonths,
  isAnalysisLoading = false,
  analysisError = null,
  onMonthSelect,
  onOptionsChange,
}: AnalyzeViewProps) {
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
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay datos para analizar
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
          <p className="text-red-600 font-medium">Error al generar análisis</p>
          <p className="text-gray-600 text-sm mt-1">
            No se pudo procesar los datos para análisis
          </p>
        </div>
      </div>
    );
  }

  // Filter monthly data based on showCurrentMonth toggle
  const filteredMonthlyData = showCurrentMonth
    ? monthlyData
    : monthlyData.filter((data) => !data.isCurrentMonth);

  const hasCurrentMonthData = monthlyData.some((data) => data.isCurrentMonth);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Análisis Financiero
        </h2>
        <p className="text-gray-600 mt-2">
          Análisis detallado de patrones de ingresos, gastos y ahorros con
          insights integrados
        </p>
      </div>

      {/* Current month toggle */}
      {hasCurrentMonthData && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                Incluir mes actual
              </h3>
              <p className="text-xs text-gray-600">
                El mes actual puede estar incompleto
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showCurrentMonth}
                onChange={(e) => onToggleCurrentMonth(e.target.checked)}
                className="sr-only peer"
                aria-label="Incluir mes actual en el análisis"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          {showCurrentMonth && (
            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
              ⚠️ El mes actual puede mostrar datos incompletos
            </div>
          )}
        </div>
      )}

      {/* Overall Summary with Integrated Insights */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Resumen General del Período
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Financial Summary */}
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-sm font-medium text-green-800">
                Total Ingresos
              </div>
              <div className="text-2xl font-bold text-green-900">
                {formatCurrency(summary.totalIncome, { showPlus: true })}
              </div>
              <div className="text-xs text-green-700 mt-1">
                {summary.transactionCount} transacciones totales
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-sm font-medium text-red-800">
                Total Gastos
              </div>
              <div className="text-2xl font-bold text-red-900">
                {formatCurrency(summary.totalExpenses)}
              </div>
              <div className="text-xs text-red-700 mt-1">
                Promedio mensual:{" "}
                {formatCurrency(
                  summary.totalExpenses /
                    Math.max(filteredMonthlyData.length, 1)
                )}
              </div>
            </div>

            <div
              className={`border rounded-lg p-4 ${
                summary.netSavings >= 0
                  ? "bg-blue-50 border-blue-200"
                  : "bg-orange-50 border-orange-200"
              }`}
            >
              <div
                className={`text-sm font-medium ${
                  summary.netSavings >= 0 ? "text-blue-800" : "text-orange-800"
                }`}
              >
                {summary.netSavings >= 0 ? "Ahorros Netos" : "Déficit Neto"}
              </div>
              <div
                className={`text-2xl font-bold ${
                  summary.netSavings >= 0 ? "text-blue-900" : "text-orange-900"
                }`}
              >
                {formatCurrency(summary.netSavings, {
                  showPlus: summary.netSavings >= 0,
                })}
              </div>
              <div
                className={`text-xs mt-1 ${
                  summary.netSavings >= 0 ? "text-blue-700" : "text-orange-700"
                }`}
              >
                {summary.netSavings >= 0
                  ? `Tasa de ahorro: ${(
                      (summary.netSavings / summary.totalIncome) *
                      100
                    ).toFixed(1)}%`
                  : "Gastos exceden ingresos"}
              </div>
            </div>
          </div>

          {/* Period Insights */}
          <div className="space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="text-sm font-medium text-purple-800">
                Período Analizado
              </div>
              <div className="text-lg font-bold text-purple-900">
                {filteredMonthlyData.length}{" "}
                {filteredMonthlyData.length === 1 ? "mes" : "meses"}
              </div>
              <div className="text-xs text-purple-700 mt-1">
                {summary.dateRange.start} - {summary.dateRange.end}
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-800">
                Promedio Mensual
              </div>
              <div className="text-lg font-bold text-gray-900">
                {formatCurrency(
                  summary.netSavings / Math.max(filteredMonthlyData.length, 1),
                  {
                    showPlus:
                      summary.netSavings /
                        Math.max(filteredMonthlyData.length, 1) >=
                      0,
                  }
                )}
              </div>
              <div className="text-xs text-gray-700 mt-1">
                Balance promedio por mes
              </div>
            </div>

            {summary.balanceSource === "calculated" && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="text-sm font-medium text-yellow-800">
                  Balance Calculado
                </div>
                <div className="text-xs text-yellow-700 mt-1">
                  Algunos valores de balance fueron calculados sintéticamente
                </div>
              </div>
            )}
          </div>

          {/* Monthly Trend Insights */}
          <div className="space-y-4">
            {filteredMonthlyData.length > 1 && (
              <>
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <div className="text-sm font-medium text-indigo-800">
                    Tendencia de Ahorros
                  </div>
                  <div className="text-lg font-bold text-indigo-900">
                    {(() => {
                      const firstMonth = filteredMonthlyData[0];
                      const lastMonth =
                        filteredMonthlyData[filteredMonthlyData.length - 1];
                      const trend = lastMonth.savings - firstMonth.savings;
                      return trend >= 0 ? "📈 Mejorando" : "📉 Empeorando";
                    })()}
                  </div>
                  <div className="text-xs text-indigo-700 mt-1">
                    {(() => {
                      const firstMonth = filteredMonthlyData[0];
                      const lastMonth =
                        filteredMonthlyData[filteredMonthlyData.length - 1];
                      const trend = lastMonth.savings - firstMonth.savings;
                      return `${formatCurrency(trend, {
                        showPlus: trend >= 0,
                      })} vs primer mes`;
                    })()}
                  </div>
                </div>

                <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                  <div className="text-sm font-medium text-teal-800">
                    Mejor Mes
                  </div>
                  <div className="text-lg font-bold text-teal-900">
                    {(() => {
                      const bestMonth = filteredMonthlyData.reduce(
                        (best, current) =>
                          current.savings > best.savings ? current : best
                      );
                      const [year, month] = bestMonth.month.split("-");
                      const date = new Date(
                        parseInt(year),
                        parseInt(month) - 1
                      );
                      return date.toLocaleDateString("es-ES", {
                        month: "short",
                        year: "numeric",
                      });
                    })()}
                  </div>
                  <div className="text-xs text-teal-700 mt-1">
                    {formatCurrency(
                      Math.max(...filteredMonthlyData.map((m) => m.savings)),
                      {
                        showPlus:
                          Math.max(
                            ...filteredMonthlyData.map((m) => m.savings)
                          ) >= 0,
                      }
                    )}{" "}
                    ahorrados
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Integrated Narrative Insights */}
      {textualSummaries.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            💡 Insights Financieros
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {textualSummaries.map((summary, index) => (
              <div
                key={index}
                className="bg-blue-50 border border-blue-200 rounded-lg p-4"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                  <p className="text-sm text-blue-800 leading-relaxed">
                    {summary}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monthly Data Table with Contextual Annotations */}
      {filteredMonthlyData.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Análisis Mensual Detallado
          </h3>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200" role="table">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mes
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ingresos
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gastos
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ahorros
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transacciones
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Insights
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMonthlyData.map((monthData, index) => {
                  const [year, month] = monthData.month.split("-");
                  const date = new Date(parseInt(year), parseInt(month) - 1);
                  const monthName = date.toLocaleDateString("es-ES", {
                    month: "long",
                    year: "numeric",
                  });

                  // Generate contextual insights for this month
                  const savingsRate =
                    monthData.totalIncome > 0
                      ? (monthData.savings / monthData.totalIncome) * 100
                      : 0;

                  let insight = "";
                  if (monthData.savings > 0) {
                    if (savingsRate > 20) {
                      insight = `🌟 Excelente mes - ${savingsRate.toFixed(
                        0
                      )}% de ahorro`;
                    } else if (savingsRate > 10) {
                      insight = `✅ Buen mes - ${savingsRate.toFixed(
                        0
                      )}% de ahorro`;
                    } else {
                      insight = `📊 Ahorro modesto - ${savingsRate.toFixed(
                        0
                      )}%`;
                    }
                  } else {
                    insight = `⚠️ Déficit de ${formatCurrency(
                      Math.abs(monthData.savings)
                    )}`;
                  }

                  if (monthData.isCurrentMonth) {
                    insight += " (mes incompleto)";
                  }

                  return (
                    <tr key={monthData.month} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900">
                            {monthName}
                          </span>
                          {monthData.isCurrentMonth && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Actual
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        <span className="font-medium text-green-600">
                          {formatCurrency(monthData.totalIncome, {
                            showPlus: true,
                          })}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        <span className="font-medium text-red-600">
                          {formatCurrency(monthData.totalExpenses)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        <span
                          className={`font-medium ${
                            monthData.savings >= 0
                              ? "text-blue-600"
                              : "text-orange-600"
                          }`}
                        >
                          {formatCurrency(monthData.savings, {
                            showPlus: monthData.savings >= 0,
                          })}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                        {monthData.transactionCount}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="max-w-xs">
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                            {insight}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detailed Monthly Analysis */}
      <ExpenseAnalysis
        analysis={monthlyAnalysis}
        availableMonths={availableAnalysisMonths}
        selectedMonth={selectedAnalysisMonth}
        onMonthChange={onMonthSelect}
        analysisOptions={analysisOptions}
        onOptionsChange={onOptionsChange}
        isLoading={isAnalysisLoading}
        error={analysisError}
      />

      {/* Raw Transaction Data */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Datos de Transacciones
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Vista detallada de todas las transacciones procesadas
          </p>
        </div>
        <div className="p-0">
          <TransactionTable
            transactions={transactions}
            summary={summary}
            dateRange={summary.dateRange}
          />
        </div>
      </div>
    </div>
  );
}
