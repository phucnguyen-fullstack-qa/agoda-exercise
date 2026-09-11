import type { FullConfig, FullResult, Reporter, Suite, TestCase, TestResult } from '@playwright/test/reporter';
import { ReportSheetWriter } from './ReportSheetWriter';

/**
 * Custom Playwright reporter that funnels every test result into a report
 * sheet. Registered alongside the built-in HTML reporter in playwright.config.ts.
 */
export default class ReportSheetReporter implements Reporter {
  private readonly writer = new ReportSheetWriter();
  private readonly outputPath = 'playwright-report/report-sheet.csv';

  onBegin(_config: FullConfig, _suite: Suite): void {
    // TODO: prepare/reset the report sheet destination.
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    this.writer.addRow({
      suiteName: test.parent.title,
      testName: test.title,
      status: result.status,
      durationMs: result.duration,
      ...(result.error?.message ? { errorMessage: result.error.message } : {}),
    });
  }

  async onEnd(_result: FullResult): Promise<void> {
    await this.writer.flush(this.outputPath);
  }
}
