import React, { useCallback, useEffect } from "react";
import { ImportCsvView } from "../views/ImportCsvView";
import { useAppContext } from "../app/context";
import { useExpenseCore } from "../expense-tracker/hooks/useExpenseCore";
import { useCsv } from "../expense-tracker/hooks/useCsv";
import { useAnalyze } from "../expense-tracker/hooks/useAnalyze";

export function ImportCsvPage() {
  const { services, logger } = useAppContext();
  const core = useExpenseCore(services);
  const csv = useCsv(core);
  const analyze = useAnalyze(core);

  // Debug logging
  useEffect(() => {
    logger.info("ImportCsvPage state:", {
      rawCount: core.state.raw.length,
      normalizedCount: core.state.normalized.length,
      monthlyCount: core.state.monthly.length,
      csvLoading: csv.isLoading,
      analysisLoading: analyze.isLoading,
      csvErrors: core.state.errors.csv,
      analysisErrors: core.state.errors.analysis,
    });
  }, [
    core.state.raw.length,
    core.state.normalized.length,
    core.state.monthly.length,
    csv.isLoading,
    analyze.isLoading,
    core.state.errors.csv,
    core.state.errors.analysis,
    logger,
  ]);

  // Enhanced file upload that runs the complete pipeline
  const handleFileUpload = useCallback(
    async (file: File) => {
      try {
        logger.info("Starting file upload pipeline for:", file.name);

        // Step 1: Upload and parse CSV
        logger.info("Step 1: Uploading CSV...");
        await csv.uploadFile(file);

        logger.info("CSV upload completed. State:", {
          rawCount: core.state.raw.length,
          normalizedCount: core.state.normalized.length,
          errors: core.state.errors.csv,
        });

        // Step 2: Run analysis if we have normalized data
        if (core.state.normalized.length > 0) {
          logger.info("Step 2: Running analysis...");
          await analyze.runAnalysis();

          logger.info("Analysis completed. State:", {
            monthlyCount: core.state.monthly.length,
            insights: core.state.insights,
            errors: core.state.errors.analysis,
          });
        } else {
          logger.warn("No normalized data available for analysis");
        }
      } catch (error) {
        logger.error("Error processing file:", error);
      }
    },
    [csv.uploadFile, analyze.runAnalysis, core.state, logger]
  );

  // Create a mock validation result if we have data
  const validationResult =
    core.state.normalized.length > 0
      ? {
          isValid: true,
          transactions: core.state.normalized,
          metadata: {
            rowCount: core.state.normalized.length,
            dateRange: {
              start: core.state.normalized[0]?.Date || "",
              end:
                core.state.normalized[core.state.normalized.length - 1]?.Date ||
                "",
            },
            balanceSource: "original" as const,
          },
          warnings: core.state.errors.csv
            ? ["Some validation warnings occurred"]
            : [],
        }
      : null;

  return (
    <ImportCsvView
      onFileUpload={handleFileUpload}
      isLoading={csv.isLoading || analyze.isLoading}
      validationResult={validationResult}
    />
  );
}
