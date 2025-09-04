import React, { useState, useEffect } from "react";
import { VisualizeView } from "../views/VisualizeView";
import { useAppContext } from "../app/context";
import { useExpenseCore } from "../expense-tracker/hooks/useExpenseCore";
import { useVisualize } from "../expense-tracker/hooks/useVisualize";

export function VisualizePage() {
  const { services } = useAppContext();
  const core = useExpenseCore(services);
  const visualize = useVisualize(core);

  // Local state for current month toggle
  const [showCurrentMonth, setShowCurrentMonth] = useState(false);

  // Mock data for now - these would come from the VM in a complete implementation
  const [balanceHistory, setBalanceHistory] = useState([]);
  const [typeBreakdown, setTypeBreakdown] = useState([]);

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

  // Generate mock data when we have transactions
  useEffect(() => {
    if (core.state.normalized.length > 0) {
      // Mock balance history
      const mockBalanceHistory = core.state.normalized.map(
        (transaction, index) => ({
          date: transaction.Date,
          balance: 1000 + index * 10, // Mock balance since balance is not in TransactionData
          isCalculated: true, // Always calculated for mock data
        })
      );
      setBalanceHistory(mockBalanceHistory as any);

      // Mock type breakdown
      const typeMap = new Map();
      core.state.normalized.forEach((transaction) => {
        const type = transaction.Type;
        const amount = Math.abs(transaction.Amount);
        typeMap.set(type, (typeMap.get(type) || 0) + amount);
      });

      const totalAmount = Array.from(typeMap.values()).reduce(
        (sum, amount) => sum + amount,
        0
      );
      const mockTypeBreakdown = Array.from(typeMap.entries()).map(
        ([type, amount]) => ({
          type,
          amount: -amount, // Negative for expenses
          percentage: (amount / totalAmount) * 100,
          count: core.state.normalized.filter((t) => t.Type === type).length,
        })
      );
      setTypeBreakdown(mockTypeBreakdown as any);
    }
  }, [core.state.normalized]);

  return (
    <VisualizeView
      monthlyData={core.state.monthly}
      balanceHistory={balanceHistory}
      typeBreakdown={typeBreakdown}
      textualSummaries={
        core.state.insights?.summaryText
          ? [core.state.insights.summaryText]
          : []
      }
      summary={summary}
      showCurrentMonth={showCurrentMonth}
      onToggleCurrentMonth={setShowCurrentMonth}
    />
  );
}
