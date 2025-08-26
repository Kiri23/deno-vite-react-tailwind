import React, { useState, useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import type { MonthlyAnalysis, AnalysisOptions } from "../types";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ExpenseAnalysisProps {
  analysis: MonthlyAnalysis | null;
  availableMonths: string[];
  selectedMonth: string | null;
  onMonthChange: (month: string) => void;
  analysisOptions: AnalysisOptions;
  onOptionsChange: (options: AnalysisOptions) => void;
  isLoading?: boolean;
  error?: string | null;
}

export const ExpenseAnalysis: React.FC<ExpenseAnalysisProps> = ({
  analysis,
  availableMonths,
  selectedMonth,
  onMonthChange,
  analysisOptions,
  onOptionsChange,
  isLoading = false,
  error = null,
}) => {
  // Visual filter state (doesn't affect the underlying data)
  const [visualFilters, setVisualFilters] = useState({
    hideTransfers: true,
    hideRoundups: true,
  });

  // Format month for display
  const formatMonth = (month: string) => {
    const [year, monthNum] = month.split("-");
    const date = new Date(parseInt(year), parseInt(monthNum) - 1);
    return date.toLocaleDateString("es-ES", {
      month: "long",
      year: "numeric",
    });
  };

  // Format currency with sign and color
  const formatCurrency = (amount: number, showSign: boolean = true) => {
    const sign = amount >= 0 ? "+" : "−";
    const absAmount = Math.abs(amount);
    return showSign
      ? `${sign}$${absAmount.toFixed(2)}`
      : `$${absAmount.toFixed(2)}`;
  };

  // Filter data for visual display
  const filteredAnalysis = useMemo(() => {
    if (!analysis) return null;

    let filteredExpensesByType = analysis.expensesByType;
    let filteredDailySpending = analysis.dailySpending;

    if (visualFilters.hideTransfers) {
      filteredExpensesByType = filteredExpensesByType.filter(
        (type) => type.type !== "Transfer"
      );
    }

    if (visualFilters.hideRoundups) {
      filteredExpensesByType = filteredExpensesByType.filter(
        (type) => type.type !== "Roundup"
      );
    }

    // Recalculate percentages for filtered types
    const totalFiltered = filteredExpensesByType.reduce(
      (sum, type) => sum + Math.abs(type.totalAmount),
      0
    );

    if (totalFiltered > 0) {
      filteredExpensesByType = filteredExpensesByType.map((type) => ({
        ...type,
        percentage: (Math.abs(type.totalAmount) / totalFiltered) * 100,
      }));
    }

    return {
      ...analysis,
      expensesByType: filteredExpensesByType,
      dailySpending: filteredDailySpending,
    };
  }, [analysis, visualFilters]);

  // Prepare daily spending chart data
  const dailyChartData = useMemo(() => {
    if (!filteredAnalysis?.dailySpending) return null;

    return {
      labels: filteredAnalysis.dailySpending.map((day) => day.day.toString()),
      datasets: [
        {
          label: "Gastos Diarios",
          data: filteredAnalysis.dailySpending.map((day) => day.totalExpenses),
          backgroundColor: "rgba(239, 68, 68, 0.8)", // red-500
          borderColor: "rgba(239, 68, 68, 1)",
          borderWidth: 1,
        },
      ],
    };
  }, [filteredAnalysis]);

  const dailyChartOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Patrón de Gastos Diarios",
        font: {
          size: 16,
          weight: "bold",
        },
      },
      tooltip: {
        callbacks: {
          title: function (context) {
            const dayIndex = context[0].dataIndex;
            const dayData = filteredAnalysis?.dailySpending[dayIndex];
            return dayData ? dayData.date : "";
          },
          label: function (context) {
            const value = context.parsed.y;
            const dayIndex = context.dataIndex;
            const dayData = filteredAnalysis?.dailySpending[dayIndex];
            const transactionCount = dayData?.transactionCount || 0;
            return `Gastos: $${value.toFixed(
              2
            )} (${transactionCount} transacciones)`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: "rgba(0, 0, 0, 0.1)",
        },
        title: {
          display: true,
          text: "Día del Mes",
        },
      },
      y: {
        grid: {
          display: true,
          color: "rgba(0, 0, 0, 0.1)",
        },
        title: {
          display: true,
          text: "Monto ($)",
        },
        ticks: {
          callback: function (value) {
            return `$${value}`;
          },
        },
      },
    },
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-red-600 font-medium">Error al cargar análisis</p>
          <p className="text-gray-600 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!selectedMonth || availableMonths.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <p className="text-gray-500">
            No hay datos suficientes para análisis detallado
          </p>
          <p className="text-gray-400 text-sm mt-1">
            Carga transacciones para ver el análisis mensual
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with month selector and options */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Análisis Detallado de Gastos
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Análisis profundo de patrones de gasto mensual
            </p>
          </div>

          {/* Month selector */}
          <div className="flex items-center gap-4">
            <label
              htmlFor="month-select"
              className="text-sm font-medium text-gray-700"
            >
              Mes:
            </label>
            <select
              id="month-select"
              value={selectedMonth}
              onChange={(e) => onMonthChange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Seleccionar mes para análisis"
            >
              {availableMonths.map((month) => (
                <option key={month} value={month}>
                  {formatMonth(month)}
                </option>
              ))}
            </select>

            {analysis?.isCurrentMonth && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Mes incompleto
              </span>
            )}
          </div>
        </div>

        {/* Analysis options */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={analysisOptions.includePending || false}
                onChange={(e) =>
                  onOptionsChange({
                    ...analysisOptions,
                    includePending: e.target.checked,
                  })
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                Incluir transacciones pendientes
              </span>
            </label>
          </div>
        </div>

        {/* Visual filters */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Filtros visuales:
          </p>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={visualFilters.hideTransfers}
                onChange={(e) =>
                  setVisualFilters({
                    ...visualFilters,
                    hideTransfers: e.target.checked,
                  })
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                Ocultar transferencias
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={visualFilters.hideRoundups}
                onChange={(e) =>
                  setVisualFilters({
                    ...visualFilters,
                    hideRoundups: e.target.checked,
                  })
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                Ocultar redondeos
              </span>
            </label>
          </div>
        </div>
      </div>

      {analysis && (
        <>
          {/* Insights */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Resumen del Mes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm font-medium text-red-800">Mayor Gasto</p>
                <p className="text-lg font-bold text-red-900">
                  {formatCurrency(analysis.insights.largestExpense.amount)}
                </p>
                <p className="text-xs text-red-700 mt-1 truncate">
                  {analysis.insights.largestExpense.description}
                </p>
                <p className="text-xs text-red-600">
                  {analysis.insights.largestExpense.date}
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-800">
                  Tipo Más Alto
                </p>
                <p className="text-lg font-bold text-blue-900">
                  {analysis.insights.highestTypePercentage.percentage.toFixed(
                    1
                  )}
                  %
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  {analysis.insights.highestTypePercentage.type}
                </p>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-sm font-medium text-purple-800">
                  Día de Mayor Gasto
                </p>
                <p className="text-lg font-bold text-purple-900">
                  {formatCurrency(
                    analysis.insights.highestSpendingDay.amount,
                    false
                  )}
                </p>
                <p className="text-xs text-purple-700 mt-1">
                  {analysis.insights.highestSpendingDay.date}
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-800">
                  Promedio Diario
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {formatCurrency(
                    analysis.insights.averageDailySpending,
                    false
                  )}
                </p>
                <p className="text-xs text-gray-700 mt-1">
                  Total:{" "}
                  {formatCurrency(analysis.insights.totalExpenses, false)}
                </p>
              </div>
            </div>
          </div>

          {/* Top-10 Expenses Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Top 10 Mayores Gastos
            </h3>

            {analysis.topExpenses.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No hay gastos para mostrar en este mes
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Descripción
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Monto
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {analysis.topExpenses.map((expense) => (
                      <tr
                        key={`${expense.date}-${expense.description}-${expense.amount}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {expense.rank}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {expense.date}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                          {expense.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {expense.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                          <span className="text-red-600">
                            {formatCurrency(expense.amount)}
                          </span>
                          <span className="sr-only">Gasto</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Expense Breakdown by Type */}
          {filteredAnalysis && filteredAnalysis.expensesByType.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Desglose por Tipo de Transacción
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Type breakdown table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tipo
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Monto
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          %
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Transacciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredAnalysis.expensesByType.map((type) => (
                        <tr key={type.type}>
                          <td className="px-4 py-4 text-sm font-medium text-gray-900">
                            {type.type}
                          </td>
                          <td className="px-4 py-4 text-sm text-right">
                            <span className="text-red-600 font-medium">
                              {formatCurrency(type.totalAmount)}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm text-right font-medium">
                            {type.percentage.toFixed(1)}%
                          </td>
                          <td className="px-4 py-4 text-sm text-right text-gray-500">
                            {type.transactionCount}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Visual percentage bars */}
                <div className="space-y-3">
                  {filteredAnalysis.expensesByType.map((type, index) => (
                    <div key={type.type} className="flex items-center">
                      <div className="w-20 text-xs text-gray-600 truncate">
                        {type.type}
                      </div>
                      <div className="flex-1 mx-3">
                        <div className="bg-gray-200 rounded-full h-4 relative">
                          <div
                            className="bg-red-500 h-4 rounded-full flex items-center justify-end pr-2"
                            style={{ width: `${type.percentage}%` }}
                          >
                            <span className="text-xs text-white font-medium">
                              {type.percentage.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Daily Spending Pattern Chart */}
          {dailyChartData && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="h-80">
                <Bar
                  data={dailyChartData}
                  options={dailyChartOptions}
                  aria-label="Gráfico de barras mostrando el patrón de gastos diarios"
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
