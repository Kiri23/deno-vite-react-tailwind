import React from "react";
import type { MonthlyTextSummaryProps } from "./types";

export const MonthlyTextSummary: React.FC<MonthlyTextSummaryProps> = ({
  summaries,
}) => {
  if (summaries.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Resumen Mensual
      </h3>

      <div className="space-y-3">
        {summaries.map((summary, index) => (
          <div
            key={index}
            className="p-4 bg-gray-50 rounded-lg border border-gray-100"
          >
            <p className="text-sm text-gray-800 leading-relaxed">{summary}</p>
          </div>
        ))}
      </div>

      {summaries.length > 1 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Mostrando {summaries.length}{" "}
            {summaries.length === 1 ? "mes" : "meses"} de actividad financiera
          </p>
        </div>
      )}
    </div>
  );
};
