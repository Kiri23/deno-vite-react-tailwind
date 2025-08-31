/**
 * Core React bridge hook for ExpenseVM integration
 *
 * Connects ExpenseVM to React using useSyncExternalStore for proper
 * state synchronization and subscription management.
 *
 * Requirements: 4.1, 4.2
 */

import { useMemo, useSyncExternalStore } from "react";
import {
  createExpenseVM,
  type ExpenseVM,
  type Services,
} from "../vm/ExpenseVM.ts";

/**
 * Core hook return interface
 */
export interface UseExpenseCoreReturn {
  /**
   * Current state snapshot from the ViewModel
   */
  state: ReturnType<ExpenseVM["getState"]>;

  /**
   * Command interface for state mutations
   */
  commands: ExpenseVM["commands"];
}

/**
 * Core React bridge hook that connects ExpenseVM to React
 *
 * Uses useSyncExternalStore for proper external state integration
 * and manages ViewModel lifecycle within React component tree.
 *
 * @param services - Service port implementations for business logic
 * @returns State and commands for UI consumption
 */
export function useExpenseCore(services: Services): UseExpenseCoreReturn {
  // Create VM instance (stable across re-renders)
  const vm = useMemo(() => createExpenseVM(services), [services]);

  // Subscribe to VM state changes using React's external store hook
  const state = useSyncExternalStore(
    vm.subscribe,
    vm.getState,
    vm.getState // Server-side snapshot (same as client for SSR compatibility)
  );

  return {
    state,
    commands: vm.commands,
  };
}
