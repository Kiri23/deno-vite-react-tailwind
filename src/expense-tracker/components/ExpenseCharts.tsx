import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import type { ExpenseChartsProps } from "./types";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

export const ExpenseCharts: React.FC<ExpenseChartsProps> = ({
  monthlyData,
  balanceHistory,
  typeBreakdown,
  textualSummaries,
  showCurrentMonth,
  onToggleCurrentMonth,
}) => {
  // Filter monthly data based on showCurrentMonth toggle
  const filteredMonthlyData = showCurrentMonth
    ? monthlyData
    : monthlyData.filter((data) => !data.isCurrentMonth);

  // Prepare monthly chart data
  const monthlyChartData = {
    labels: filteredMonthlyData.map((data) => {
      const [year, month] = data.month.split("-");
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return date.toLocaleDateString("es-ES", {
        month: "short",
        year: "numeric",
      });
    }),
    datasets: [
      {
        label: "Ingresos",
        data: filteredMonthlyData.map((data) => data.totalIncome),
        backgroundColor: "rgba(34, 197, 94, 0.8)", // green-500
        borderColor: "rgba(34, 197, 94, 1)",
        borderWidth: 1,
      },
      {
        label: "Gastos",
        data: filteredMonthlyData.map((data) => Math.abs(data.totalExpenses)),
        backgroundColor: "rgba(239, 68, 68, 0.8)", // red-500
        borderColor: "rgba(239, 68, 68, 1)",
        borderWidth: 1,
      },
      {
        label: "Ahorros",
        data: filteredMonthlyData.map((data) => data.savings),
        backgroundColor: filteredMonthlyData.map(
          (data) =>
            data.savings >= 0
              ? "rgba(34, 197, 94, 0.6)" // green for positive savings
              : "rgba(239, 68, 68, 0.6)" // red for deficit
        ),
        borderColor: filteredMonthlyData.map((data) =>
          data.savings >= 0 ? "rgba(34, 197, 94, 1)" : "rgba(239, 68, 68, 1)"
        ),
        borderWidth: 1,
      },
    ],
  };

  // Prepare balance history chart data
  const balanceChartData = {
    labels: balanceHistory.map((point) => {
      const date = new Date(point.date);
      return date.toLocaleDateString("es-ES", {
        month: "short",
        day: "numeric",
      });
    }),
    datasets: [
      {
        label: "Balance de Cuenta",
        data: balanceHistory.map((point) => point.balance),
        borderColor: "rgba(59, 130, 246, 1)", // blue-500
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderWidth: 2,
        pointBackgroundColor: balanceHistory.map(
          (point) =>
            point.isCalculated
              ? "rgba(245, 158, 11, 1)" // amber-500 for calculated
              : "rgba(59, 130, 246, 1)" // blue-500 for original
        ),
        pointBorderColor: balanceHistory.map((point) =>
          point.isCalculated ? "rgba(245, 158, 11, 1)" : "rgba(59, 130, 246, 1)"
        ),
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: false,
      },
    ],
  };

  // Prepare type breakdown chart data
  const typeChartData = {
    labels: typeBreakdown.map((type) => type.type),
    datasets: [
      {
        label: "Gastos por Tipo",
        data: typeBreakdown.map((type) => Math.abs(type.amount)),
        backgroundColor: [
          "rgba(239, 68, 68, 0.8)", // red-500
          "rgba(245, 158, 11, 0.8)", // amber-500
          "rgba(34, 197, 94, 0.8)", // green-500
          "rgba(59, 130, 246, 0.8)", // blue-500
          "rgba(147, 51, 234, 0.8)", // purple-500
          "rgba(236, 72, 153, 0.8)", // pink-500
        ],
        borderColor: [
          "rgba(239, 68, 68, 1)",
          "rgba(245, 158, 11, 1)",
          "rgba(34, 197, 94, 1)",
          "rgba(59, 130, 246, 1)",
          "rgba(147, 51, 234, 1)",
          "rgba(236, 72, 153, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart options with accessibility and Spanish formatting
  const monthlyChartOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      title: {
        display: true,
        text: "Ingresos, Gastos y Ahorros Mensuales",
        font: {
          size: 16,
          weight: "bold",
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.dataset.label || "";
            const value = context.parsed.y;
            const sign = label === "Gastos" ? "−" : value >= 0 ? "+" : "−";
            return `${label}: ${sign}$${Math.abs(value).toFixed(2)}`;
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
          text: "Mes",
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

  const balanceChartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      title: {
        display: true,
        text: "Historial de Balance de Cuenta",
        font: {
          size: 16,
          weight: "bold",
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const value = context.parsed.y;
            const point = balanceHistory[context.dataIndex];
            const calculatedText = point.isCalculated ? " (calculado)" : "";
            return `Balance: $${value.toFixed(2)}${calculatedText}`;
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
          text: "Fecha",
        },
      },
      y: {
        grid: {
          display: true,
          color: "rgba(0, 0, 0, 0.1)",
        },
        title: {
          display: true,
          text: "Balance ($)",
        },
        ticks: {
          callback: function (value) {
            return `$${value}`;
          },
        },
      },
    },
  };

  const typeChartOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Gastos por Tipo de Transacción",
        font: {
          size: 16,
          weight: "bold",
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const value = context.parsed.y;
            const type = typeBreakdown[context.dataIndex];
            return `${type.type}: $${value.toFixed(
              2
            )} (${type.percentage.toFixed(1)}%)`;
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
          text: "Tipo de Transacción",
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

  const hasCurrentMonthData = monthlyData.some((data) => data.isCurrentMonth);

  if (filteredMonthlyData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <p className="text-gray-500">
          No hay suficientes datos para generar gráficos
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
                aria-label="Incluir mes actual en los gráficos"
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

      {/* Monthly bar chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="h-80">
          <Bar
            data={monthlyChartData}
            options={monthlyChartOptions}
            aria-label="Gráfico de barras mostrando ingresos, gastos y ahorros mensuales"
          />
        </div>
      </div>

      {/* Balance history line chart */}
      {balanceHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="h-80">
            <Line
              data={balanceChartData}
              options={balanceChartOptions}
              aria-label="Gráfico de línea mostrando el historial de balance de cuenta"
            />
          </div>
        </div>
      )}

      {/* Type breakdown bar chart */}
      {typeBreakdown.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="h-80">
            <Bar
              data={typeChartData}
              options={typeChartOptions}
              aria-label="Gráfico de barras mostrando gastos por tipo de transacción"
            />
          </div>
        </div>
      )}
    </div>
  );
};
