import React, { useState, useMemo } from "react";
import type { TransactionTableProps, TransactionData } from "./types";

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  summary,
  dateRange,
}) => {
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Sort transactions by date
  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => {
      const dateA = new Date(a.Date).getTime();
      const dateB = new Date(b.Date).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });
  }, [transactions, sortOrder]);

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
  };

  const formatAmount = (amount: number) => {
    const sign = amount >= 0 ? "+" : "−"; // Using minus sign (−) instead of hyphen (-)
    const absAmount = Math.abs(amount);
    return `${sign}$${absAmount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getAmountColorClass = (amount: number) => {
    return amount >= 0 ? "text-green-600" : "text-red-600";
  };

  const formatBalance = (balance: number) => {
    return `$${balance.toFixed(2)}`;
  };

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <p className="text-gray-500">No hay transacciones para mostrar</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header with metadata */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Transacciones
            </h3>
            <p className="text-sm text-gray-600">
              {transactions.length} transacciones •{" "}
              {formatDate(dateRange.start)} - {formatDate(dateRange.end)}
            </p>
          </div>
          <div className="text-sm text-gray-600">
            {summary.balanceSource === "calculated" && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Balance calculado
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200" role="table">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={toggleSortOrder}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleSortOrder();
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`Ordenar por fecha ${
                  sortOrder === "desc" ? "ascendente" : "descendente"
                }`}
              >
                <div className="flex items-center space-x-1">
                  <span>Fecha</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      sortOrder === "desc" ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Descripción
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Tipo
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Monto
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Balance
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Estado
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedTransactions.map((transaction, index) => (
              <tr
                key={`${transaction.Date}-${transaction.Description}-${index}`}
                className="hover:bg-gray-50"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(transaction.Date)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                  <div className="truncate" title={transaction.Description}>
                    {transaction.Description}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {transaction.Type}
                </td>
                <td
                  className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${getAmountColorClass(
                    transaction.Amount
                  )}`}
                  aria-label={`${
                    transaction.Amount >= 0 ? "Ingreso" : "Gasto"
                  } de ${Math.abs(transaction.Amount)} dólares`}
                >
                  {formatAmount(transaction.Amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {formatBalance(transaction["Current balance"])}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      transaction.Status === "Posted"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {transaction.Status === "Posted"
                      ? "Procesado"
                      : "Pendiente"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary footer */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="font-medium text-gray-700">Total Ingresos:</span>
            <span
              className="font-semibold text-green-600"
              aria-label={`Ingresos totales: ${summary.totalIncome} dólares`}
            >
              +${summary.totalIncome.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-700">Total Gastos:</span>
            <span
              className="font-semibold text-red-600"
              aria-label={`Gastos totales: ${Math.abs(
                summary.totalExpenses
              )} dólares`}
            >
              −${Math.abs(summary.totalExpenses).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-700">Balance Neto:</span>
            <span
              className={`font-semibold ${getAmountColorClass(
                summary.netSavings
              )}`}
              aria-label={`Balance neto: ${
                summary.netSavings >= 0 ? "ganancia" : "pérdida"
              } de ${Math.abs(summary.netSavings)} dólares`}
            >
              {formatAmount(summary.netSavings)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
