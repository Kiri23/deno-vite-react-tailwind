import React from "react";
import { ExpenseCharts } from "../expense-tracker/components/ExpenseCharts";
import { formatCurrency } from "../utils/formatting/currency";
import type {
  MonthlyData,
  BalancePoint,
  TypeSummary,
  OverallSummary,
} from "../expense-tracker/types";

export interface VisualizeViewProps {
  monthlyData: MonthlyData[];
  balanceHistory: BalancePoint[];
  typeBreakdown: TypeSummary[];
  textualSummaries: string[];
  summary: OverallSummary | null;
  showCurrentMonth: boolean;
  onToggleCurrentMonth: (show: boolean) => void;
}

export function VisualizeView({
  monthlyData,
  balanceHistory,
  typeBreakdown,
  textualSummaries,
  summary,
  showCurrentMonth,
  onToggleCurrentMonth,
}: VisualizeViewProps) {
  if (monthlyData.length === 0) {
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
            No hay datos para visualizar
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
          Visualización de Datos
        </h2>
        <p className="text-gray-600 mt-2">
          Gráficos interactivos con anotaciones contextuales y insights
          integrados
        </p>
      </div>

      {/* Chart Insights Panel */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📊 Insights de Visualización
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly Trends Insights */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-800">
              Tendencias Mensuales
            </h4>
            {filteredMonthlyData.length > 1 ? (
              <div className="space-y-2">
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <div className="text-xs font-medium text-blue-800">
                    Patrón de Ahorros
                  </div>
                  <div className="text-sm text-blue-700 mt-1">
                    {(() => {
                      const positiveMonths = filteredMonthlyData.filter(
                        (m) => m.savings > 0
                      ).length;
                      const totalMonths = filteredMonthlyData.length;
                      const percentage = (positiveMonths / totalMonths) * 100;

                      if (percentage >= 80) {
                        return `🌟 Excelente: ${positiveMonths}/${totalMonths} meses con ahorros`;
                      } else if (percentage >= 60) {
                        return `✅ Bueno: ${positiveMonths}/${totalMonths} meses con ahorros`;
                      } else if (percentage >= 40) {
                        return `⚠️ Regular: ${positiveMonths}/${totalMonths} meses con ahorros`;
                      } else {
                        return `🔴 Preocupante: Solo ${positiveMonths}/${totalMonths} meses con ahorros`;
                      }
                    })()}
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded p-3">
                  <div className="text-xs font-medium text-green-800">
                    Volatilidad de Ingresos
                  </div>
                  <div className="text-sm text-green-700 mt-1">
                    {(() => {
                      const incomes = filteredMonthlyData.map(
                        (m) => m.totalIncome
                      );
                      const avgIncome =
                        incomes.reduce((a, b) => a + b, 0) / incomes.length;
                      const variance =
                        incomes.reduce(
                          (acc, income) =>
                            acc + Math.pow(income - avgIncome, 2),
                          0
                        ) / incomes.length;
                      const stdDev = Math.sqrt(variance);
                      const coefficient = (stdDev / avgIncome) * 100;

                      if (coefficient < 10) {
                        return `📈 Muy estable (±${coefficient.toFixed(1)}%)`;
                      } else if (coefficient < 25) {
                        return `📊 Moderadamente estable (±${coefficient.toFixed(
                          1
                        )}%)`;
                      } else {
                        return `📉 Variable (±${coefficient.toFixed(1)}%)`;
                      }
                    })()}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Se necesitan más meses para análisis de tendencias
              </p>
            )}
          </div>

          {/* Balance History Insights */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-800">
              Historial de Balance
            </h4>
            {balanceHistory.length > 0 ? (
              <div className="space-y-2">
                <div className="bg-purple-50 border border-purple-200 rounded p-3">
                  <div className="text-xs font-medium text-purple-800">
                    Tendencia General
                  </div>
                  <div className="text-sm text-purple-700 mt-1">
                    {(() => {
                      const firstBalance = balanceHistory[0].balance;
                      const lastBalance =
                        balanceHistory[balanceHistory.length - 1].balance;
                      const change = lastBalance - firstBalance;
                      const changePercent =
                        (change / Math.abs(firstBalance)) * 100;

                      if (change > 0) {
                        return `📈 Crecimiento de ${formatCurrency(
                          change
                        )} (${changePercent.toFixed(1)}%)`;
                      } else if (change < 0) {
                        return `📉 Disminución de ${formatCurrency(
                          Math.abs(change)
                        )} (${Math.abs(changePercent).toFixed(1)}%)`;
                      } else {
                        return `➡️ Balance estable`;
                      }
                    })()}
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                  <div className="text-xs font-medium text-yellow-800">
                    Calidad de Datos
                  </div>
                  <div className="text-sm text-yellow-700 mt-1">
                    {(() => {
                      const calculatedPoints = balanceHistory.filter(
                        (p) => p.isCalculated
                      ).length;
                      const totalPoints = balanceHistory.length;
                      const originalPercent =
                        ((totalPoints - calculatedPoints) / totalPoints) * 100;

                      if (originalPercent >= 90) {
                        return `✅ ${originalPercent.toFixed(
                          0
                        )}% datos originales`;
                      } else if (originalPercent >= 70) {
                        return `⚠️ ${originalPercent.toFixed(
                          0
                        )}% datos originales`;
                      } else {
                        return `🔴 Solo ${originalPercent.toFixed(
                          0
                        )}% datos originales`;
                      }
                    })()}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No hay suficientes datos de balance
              </p>
            )}
          </div>

          {/* Type Breakdown Insights */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-800">
              Distribución de Gastos
            </h4>
            {typeBreakdown.length > 0 ? (
              <div className="space-y-2">
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <div className="text-xs font-medium text-red-800">
                    Tipo Dominante
                  </div>
                  <div className="text-sm text-red-700 mt-1">
                    {(() => {
                      const topType = typeBreakdown[0];
                      return `${topType.type}: ${topType.percentage.toFixed(
                        1
                      )}% (${formatCurrency(Math.abs(topType.amount))})`;
                    })()}
                  </div>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded p-3">
                  <div className="text-xs font-medium text-orange-800">
                    Diversificación
                  </div>
                  <div className="text-sm text-orange-700 mt-1">
                    {(() => {
                      const significantTypes = typeBreakdown.filter(
                        (t) => t.percentage >= 10
                      ).length;
                      const totalTypes = typeBreakdown.length;

                      if (significantTypes <= 2) {
                        return `🎯 Concentrado: ${significantTypes} tipos principales`;
                      } else if (significantTypes <= 4) {
                        return `📊 Balanceado: ${significantTypes} tipos principales`;
                      } else {
                        return `🌐 Diversificado: ${significantTypes} tipos principales`;
                      }
                    })()}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No hay datos de tipos de transacción
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Contextual Annotations for Charts */}
      {textualSummaries.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            💡 Anotaciones Contextuales
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {textualSummaries.map((summary, index) => (
              <div
                key={index}
                className="bg-indigo-50 border border-indigo-200 rounded-lg p-4"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">
                        {index + 1}
                      </span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-indigo-800 leading-relaxed">
                      {summary}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-xs text-gray-600">
              💡 <strong>Tip:</strong> Estas anotaciones proporcionan contexto
              adicional para interpretar los gráficos. Úsalas como guía para
              entender patrones y tendencias en tus datos financieros.
            </p>
          </div>
        </div>
      )}

      {/* Chart Legend and Accessibility Guide */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          🎨 Guía de Visualización
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-800 mb-2">
              Colores de Gráficos
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                <span className="text-gray-700">
                  Ingresos / Valores positivos
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                <span className="text-gray-700">
                  Gastos / Valores negativos
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                <span className="text-gray-700">
                  Balance / Datos originales
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
                <span className="text-gray-700">Datos calculados</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-800 mb-2">
              Interactividad
            </h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• Pasa el cursor sobre puntos para detalles</li>
              <li>• Los tooltips muestran valores exactos</li>
              <li>• Las fechas se muestran en formato completo</li>
              <li>• Los montos incluyen formato de moneda</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-800 mb-2">
              Accesibilidad
            </h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• Gráficos incluyen etiquetas ARIA</li>
              <li>• Colores complementados con patrones</li>
              <li>• Datos disponibles en formato tabular</li>
              <li>• Navegación por teclado soportada</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Charts with Enhanced Context */}
      <div className="space-y-6">
        <ExpenseCharts
          monthlyData={monthlyData}
          balanceHistory={balanceHistory}
          typeBreakdown={typeBreakdown}
          textualSummaries={textualSummaries}
          showCurrentMonth={showCurrentMonth}
          onToggleCurrentMonth={onToggleCurrentMonth}
        />
      </div>

      {/* Chart Data Summary */}
      {summary && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📈 Resumen de Datos Visualizados
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-800">
                Puntos de Datos
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {filteredMonthlyData.length}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                Meses visualizados
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-800">
                Balance Points
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {balanceHistory.length}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                Puntos de balance histórico
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-800">
                Tipos de Gasto
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {typeBreakdown.length}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                Categorías diferentes
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-800">
                Período Total
              </div>
              <div className="text-lg font-bold text-gray-900">
                {(() => {
                  if (!summary.dateRange.start || !summary.dateRange.end)
                    return "N/A";
                  const start = new Date(summary.dateRange.start);
                  const end = new Date(summary.dateRange.end);
                  const diffTime = Math.abs(end.getTime() - start.getTime());
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  return `${diffDays} días`;
                })()}
              </div>
              <div className="text-xs text-gray-600 mt-1">Rango de fechas</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
