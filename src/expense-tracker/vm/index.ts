/**
 * ViewModel module exports
 *
 * Provides clean barrel exports for ExpenseVM and related interfaces
 */

export {
  createExpenseVM,
  type ExpenseState,
  type ExpenseCommands,
  type ExpenseVM,
  type Services,
} from "./ExpenseVM.ts";
