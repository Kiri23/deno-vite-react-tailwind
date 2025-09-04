import React, { useState } from "react";
import { AnalyzeView } from "../views/AnalyzeView";
import { useAppContext } from "../app/context";
import { useExpenseCore } from "../expense-tracker/hooks/useExpenseCore";
import { useAnalyze } from "../expense-tracker/hooks/useAnalyze";
import { useExpenseTracker } from "../expense-tracker/hooks/useExpenseTracker";

export function AnalyzePage() {
  const { services } = useAppContext();
  const core = useExpenseCore(services);
  const analyze = useAnalyze(core);

  // Use the existing useExpenseTracker for expense analysis functionality
  const expenseTracker = useExpenseTracker();

  // Local state for current month toggle
  const [showCurrentMonth, setShowCurrentMonth] = useState(false);

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
          transactionCount: core.state.normalized.length,
          dateRange: {
            start: core.state.normalized[0]?.Date || "",
            end:
              core.state.normalized[core.state.normalized.length - 1]?.Date ||
              "",
          },
          balanceSource: "original" as const,
        }
      : null;

  return (
    <AnalyzeView
      transactions={core.state.normalized}
      monthlyData={analyze.monthly}
      summary={summary}
      textualSummaries={
        analyze.insights?.summaryText ? [analyze.insights.summaryText] : []
      }
      showCurrentMonth={showCurrentMonth}
      onToggleCurrentMonth={setShowCurrentMonth}
      // Expense Analysis props from existing hook
      selectedAnalysisMonth={expenseTracker.selectedAnalysisMonth}
      analysisOptions={expenseTracker.analysisOptions}
      monthlyAnalysis={expenseTracker.monthlyAnalysis || null}
      availableAnalysisMonths={expenseTracker.availableAnalysisMonths}
      isAnalysisLoading={expenseTracker.isAnalysisLoading}
      analysisError={expenseTracker.analysisError}
      onMonthSelect={expenseTracker.setSelectedAnalysisMonth}
      onOptionsChange={expenseTracker.setAnalysisOptions}
    />
  );
}
