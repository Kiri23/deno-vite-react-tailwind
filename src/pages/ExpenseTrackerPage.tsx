import React from "react";
import { ExpenseTracker } from "../expense-tracker";

/**
 * Page component that wraps the original ExpenseTracker component
 * This provides the original monolithic expense tracker experience
 */
export function ExpenseTrackerPage() {
  return <ExpenseTracker />;
}
