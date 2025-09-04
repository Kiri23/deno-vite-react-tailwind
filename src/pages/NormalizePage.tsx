import React from "react";
import { NormalizeView } from "../views/NormalizeView";
import { useAppContext } from "../app/context";
import { useExpenseCore } from "../expense-tracker/hooks/useExpenseCore";
import { useCsv } from "../expense-tracker/hooks/useCsv";

export function NormalizePage() {
  const { services } = useAppContext();
  const core = useExpenseCore(services);
  const csv = useCsv(core);

  // Create a basic summary from the state
  const summary =
    core.state.monthly.length > 0
      ? {
          totalIncome: core.state.monthly.reduce(
            (sum, m) => sum + m.totalIncome,
            0
          ),
          totalExpenses: core.state.monthly.reduce(
            (sum, m) => sum + m.totalExpenses,
            0
          ),
          netSavings: core.state.monthly.reduce((sum, m) => sum + m.savings, 0),
          transactionCount: csv.normalized.length,
          dateRange: {
            start: csv.normalized[0]?.Date || "",
            end: csv.normalized[csv.normalized.length - 1]?.Date || "",
          },
          balanceSource: "original" as const,
        }
      : null;

  return (
    <NormalizeView
      transactions={csv.normalized}
      summary={summary}
      validationResult={null} // TODO: Add validation result to VM state
      isLoading={csv.isLoading}
    />
  );
}
