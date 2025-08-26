# Expense Tracker Hooks

## useExpenseTracker

The main hook for expense tracker functionality that orchestrates all services and manages application state.

### Features

#### Service Orchestration

- **CsvService Integration**: Handles CSV file validation, parsing, and normalization
- **AnalysisService Integration**: Manages data aggregation, monthly summaries, and calculations
- **VizService Integration**: Prepares chart data and generates textual summaries

#### State Management

- **Transaction Data**: Normalized transaction records
- **Monthly Data**: Aggregated monthly summaries with savings calculations
- **Summary Data**: Overall period statistics and metadata
- **Balance History**: Timeline of account balance changes
- **Type Breakdown**: Transaction categorization and analysis
- **Textual Summaries**: Natural language monthly narratives in Spanish

#### UI Controls

- **Current Month Toggle**: Include/exclude current month from analysis
- **Loading States**: Processing indicators during file operations
- **Validation Results**: Detailed error and warning information

### Enhanced Error Handling

#### Error Categorization

- **Blocking Errors**: Prevent processing (missing columns, file too large)
- **Warnings**: Allow processing with notifications (invalid dates, calculated balance)

#### User-Friendly Messages

- **File Size Errors**: Specific guidance on file size limits and solutions
- **Missing Columns**: Clear list of required columns with examples
- **Invalid Data**: Detailed explanations with recovery suggestions
- **Network/System Errors**: Contextual error messages with troubleshooting steps

#### Recovery Suggestions

Each error type includes actionable recovery suggestions:

- **Missing Columns**: Export guidance and column verification steps
- **Invalid Dates**: Format examples and validation tips
- **Invalid Amounts**: Number format requirements and common fixes
- **File Size**: Splitting strategies and optimization tips

### Usage

```typescript
import { useExpenseTracker } from "./hooks";

function ExpenseTrackerComponent() {
  const {
    // State
    transactions,
    monthlyData,
    summary,
    balanceHistory,
    typeBreakdown,
    textualSummaries,
    showCurrentMonth,
    isLoading,
    validationResult,

    // Actions
    processCSVFile,
    toggleCurrentMonth,
    clearData,
  } = useExpenseTracker();

  const handleFileUpload = async (file: File) => {
    await processCSVFile(file);

    // Check for errors
    if (validationResult && !validationResult.isValid) {
      // Handle blocking errors
      console.error("Validation errors:", validationResult.errors);
    }

    // Check for warnings
    if (validationResult?.warnings?.length > 0) {
      // Display warnings to user
      console.warn("Warnings:", validationResult.warnings);
    }
  };

  return (
    <div>
      {/* File upload component */}
      {/* Transaction table */}
      {/* Charts and visualizations */}
      {/* Error display */}
    </div>
  );
}
```

### Data Flow

1. **File Upload** → `processCSVFile(file)`
2. **CSV Validation** → `CsvService.validateAndParse()`
3. **Error Enhancement** → User-friendly messages and categorization
4. **Data Analysis** → `AnalysisService` calculations
5. **Visualization Prep** → `VizService` chart data and narratives
6. **State Updates** → React state management
7. **UI Rendering** → Component updates with new data

### Error Handling Flow

1. **File Validation** → Size, type, and format checks
2. **CSV Parsing** → Column validation and data extraction
3. **Error Categorization** → Blocking vs. warning classification
4. **Message Enhancement** → User-friendly explanations and examples
5. **Recovery Suggestions** → Actionable next steps for users
6. **State Management** → Appropriate data clearing or preservation

### Testing

The hook includes comprehensive test coverage:

- **Basic functionality**: State management and service integration
- **Error scenarios**: All error types and edge cases
- **User feedback**: Enhanced messages and recovery suggestions
- **Service integration**: Proper data flow between services
- **State transitions**: Loading states and data clearing

Run tests with:

```bash
npm test src/expense-tracker/hooks/
```
