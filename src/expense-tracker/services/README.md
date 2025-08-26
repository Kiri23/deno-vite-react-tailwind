# Expense Tracker Services

This directory contains the service layer for the expense tracker application, implementing a clean separation of concerns for data processing, analysis, and visualization.

## Services Overview

### CsvService

Handles CSV file validation, parsing, and data normalization using Polars.js.

**Key Features:**

- File size validation (20MB limit)
- Robust CSV parsing with Polars.js
- Column validation (case-insensitive)
- Transaction type normalization
- Date normalization to YYYY-MM-DD format
- Amount canonicalization (negative = expense, positive = income)
- Synthetic balance calculation when needed

### AnalysisService ✅ **COMPLETED**

Handles data aggregation and analysis for processed transaction data.

**Key Features:**

- **Monthly Data Aggregation**: Groups transactions by month (YYYY-MM format), calculates income/expenses/savings per month
- **Current Month Detection**: Automatically excludes current month by default (with toggle option)
- **Overall Summary Calculations**: Total income, expenses, net savings for entire period with date range metadata
- **Transaction Type Breakdown**: Groups expenses by normalized type with percentages
- **Balance History Generation**: Creates chronological balance points for chart visualization

**Methods:**

- `calculateMonthlySummary(transactions, excludeCurrentMonth?)`: Returns monthly aggregated data
- `calculateOverallSummary(transactions)`: Returns overall period summary
- `groupByTransactionType(transactions)`: Returns expense breakdown by type
- `generateBalanceHistory(transactions)`: Returns chronological balance points

### VizService (Planned)

Will handle chart data preparation and textual summary generation.

## Architecture

```
CSV File → CsvService (validate/normalize) → AnalysisService (aggregate/analyze) → VizService (prepare charts) → UI Components
```

## Data Flow

1. **CSV Processing**: CsvService validates and normalizes raw CSV data
2. **Analysis**: AnalysisService aggregates normalized data into monthly summaries, type breakdowns, etc.
3. **Visualization**: VizService prepares data for charts and generates textual summaries
4. **UI Rendering**: React components consume prepared data for display

## Testing

All services include comprehensive unit tests and integration tests:

- **Unit Tests**: Test individual methods with various data scenarios
- **Integration Tests**: Test service interactions with real CSV data
- **Edge Cases**: Empty data, invalid dates, current month handling, deficit scenarios

Run tests with:

```bash
npm test -- --run src/expense-tracker/services/
```

## Implementation Status

- ✅ **CsvService**: Complete with validation, parsing, and normalization
- ✅ **AnalysisService**: Complete with monthly aggregation, summaries, and type breakdown
- ⏳ **VizService**: Planned for next implementation phase

## Key Design Decisions

1. **Static Methods**: Services use static methods for pure functions, with instance methods for interface compliance
2. **Immutable Data**: All methods return new objects without modifying input data
3. **Error Handling**: Graceful handling of edge cases (empty data, invalid dates, etc.)
4. **Current Month Logic**: Excludes incomplete current month by default to avoid misleading data
5. **Balance Source Tracking**: Metadata tracks whether balances are original or calculated
6. **Type Safety**: Full TypeScript interfaces for all data structures

## Usage Example

```typescript
import { CsvService, AnalysisService } from "./services";

// Process CSV file
const csvResult = await CsvService.validateAndParse(file);
if (csvResult.isValid) {
  const transactions = csvResult.transactions!;

  // Analyze data
  const monthlyData = AnalysisService.calculateMonthlySummary(transactions);
  const overallSummary = AnalysisService.calculateOverallSummary(transactions);
  const typeBreakdown = AnalysisService.groupByTransactionType(transactions);
  const balanceHistory = AnalysisService.generateBalanceHistory(transactions);

  // Use analyzed data in UI components
}
```
