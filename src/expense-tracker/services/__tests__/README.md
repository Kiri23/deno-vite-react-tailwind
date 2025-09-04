# Service Contract Test Suite

This directory contains the shared contract test suite that validates service port implementations for compliance with the expense tracker modularization architecture.

## Overview

The contract test suite ensures that both LocalService and future RemoteService implementations pass the same validation tests, guaranteeing swap compatibility without breaking dependent code (ViewModels, hooks, UI components).

## Key Files

### `ContractTestSuite.ts`

The main contract test suite implementation that provides:

- Standardized test fixtures and expected results
- Comprehensive validation for all service ports (CsvPort, AnalysisPort, VizPort)
- Data consistency, error handling, and method signature validation
- Performance tracking and detailed error reporting

### `ContractValidation.test.ts`

Demonstration test file showing how to use the contract test suite with LocalService implementations. This serves as a template for validating future RemoteService implementations.

## Usage

### Validating LocalService Implementations

```typescript
import { createLocalServices } from "../local/index.ts";
import { createContractTestSuite } from "./ContractTestSuite.ts";

// Create services and test suite
const services = createLocalServices();
const contractTestSuite = createContractTestSuite();

// Validate all services
const result = await contractTestSuite.validateAllPorts(services);

if (result.allPassed) {
  console.log("All contract tests passed!");
} else {
  console.error("Contract validation failed:", result.summary);
}
```

### Validating Individual Ports

```typescript
// Validate specific service ports
const csvResult = await contractTestSuite.validateCsvPort(services.csv);
const analysisResult = await contractTestSuite.validateAnalysisPort(
  services.analysis
);
const vizResult = await contractTestSuite.validateVizPort(services.viz);
```

### Using with ServiceFactory

```typescript
import { LocalServiceFactory } from "../local/index.ts";

const factory = new LocalServiceFactory();
const validationResult = await factory.validateContracts();

console.log(
  `Tests: ${validationResult.summary.passedTests}/${validationResult.summary.totalTests}`
);
```

## Contract Validation Areas

### CsvPort Validation

- **Method Signatures**: Validates all required methods exist and are callable
- **Date Normalization**: Tests foundation.md compliance for date formatting (YYYY-MM-DD)
- **Amount Canonicalization**: Validates deposit/withdrawal sign conventions
- **Transaction Normalization**: Tests type normalization and data structure consistency

### AnalysisPort Validation

- **Method Signatures**: Validates all required analysis methods
- **Monthly Summary Calculations**: Tests income/expense/savings calculations and chronological ordering
- **Overall Summary Calculations**: Validates totals, date ranges, and balance source tracking
- **Balance History Generation**: Tests chronological ordering and calculated vs original balance flags
- **Transaction Type Grouping**: Validates expense categorization and percentage calculations

### VizPort Validation

- **Method Signatures**: Validates all required visualization methods
- **Chart Data Preparation**: Tests chart structure, datasets, and accessibility features
- **Balance Chart Data**: Validates line chart data for balance history visualization
- **Type Chart Data**: Tests pie/bar chart data for expense breakdowns
- **Textual Summary Generation**: Validates Spanish narrative content and structure

## Foundation.md Compliance

The contract test suite validates compliance with foundation.md standards:

- **Currency Formatting**: ASCII hyphen-minus for negative values, 2 decimal places
- **Date Normalization**: YYYY-MM-DD format with America/New_York timezone assumption
- **Amount Canonicalization**: Deposits positive, withdrawals negative, maintain original for others
- **Balance Handling**: Prefer original balance, calculate synthetic only when necessary
- **Type Normalization**: Standardized transaction type mapping

## Error Handling Validation

The test suite validates consistent error handling:

- **Method Existence**: Ensures all port methods are implemented
- **Data Structure Validation**: Validates return types and required fields
- **Edge Case Handling**: Tests empty arrays, invalid data, and boundary conditions
- **Performance Tracking**: Measures execution time for all test cases

## Future RemoteService Validation

When implementing RemoteService classes, they must pass the same contract test suite:

```typescript
// Future RemoteService validation example
import { createRemoteServices } from "../remote/index.ts"; // Future implementation
import { createContractTestSuite } from "./ContractTestSuite.ts";

const remoteServices = createRemoteServices(queryClient);
const contractTestSuite = createContractTestSuite();

// Must pass the same tests as LocalService
const result = await contractTestSuite.validateAllPorts(remoteServices);
expect(result.allPassed).toBe(true);
```

## Test Data Fixtures

The contract test suite includes standardized test fixtures:

- **Valid CSV File**: 6 transactions across 2 months with proper headers
- **Invalid CSV File**: Missing required columns for error testing
- **Raw Transactions**: Pre-normalization data with various transaction types
- **Normalized Transactions**: Post-normalization data following foundation.md standards
- **Monthly Data**: Aggregated financial summaries for visualization
- **Balance History**: Chronological balance points for chart generation
- **Type Summary**: Expense breakdowns by transaction type

## Performance Expectations

The contract test suite tracks performance metrics:

- **Individual Test Duration**: Each test case measures execution time
- **Total Suite Duration**: Complete validation suite timing
- **Service Initialization**: Factory creation and validation timing

Typical performance expectations:

- LocalService validation: < 100ms total
- Individual port validation: < 50ms each
- RemoteService validation: < 500ms total (including network latency)

## Integration with CI/CD

The contract test suite can be integrated into continuous integration:

```bash
# Run contract validation tests
deno task test src/expense-tracker/services/__tests__/ContractValidation.test.ts

# Run all service tests including contract validation
deno task test src/expense-tracker/services/__tests__/
```

## Troubleshooting

### Common Validation Failures

1. **Method Signature Mismatch**: Ensure all port methods are implemented with correct signatures
2. **Data Structure Inconsistency**: Validate return types match expected interfaces
3. **Foundation.md Non-compliance**: Check date formats, amount signs, and type normalization
4. **Performance Issues**: Optimize service implementations if validation times exceed expectations

### Debugging Contract Failures

The test suite provides detailed error reporting:

```typescript
const result = await contractTestSuite.validateAllPorts(services);

if (!result.allPassed) {
  console.error("Failed tests by port:");
  console.error("CSV:", result.csvPort.errors);
  console.error("Analysis:", result.analysisPort.errors);
  console.error("Viz:", result.vizPort.errors);

  // Detailed test case failures
  const failedTests = [
    ...result.csvPort.testCases.filter((t) => !t.passed),
    ...result.analysisPort.testCases.filter((t) => !t.passed),
    ...result.vizPort.testCases.filter((t) => !t.passed),
  ];

  console.error("Failed test cases:", failedTests);
}
```

This comprehensive contract validation ensures that service implementations can be swapped without breaking the application architecture.
