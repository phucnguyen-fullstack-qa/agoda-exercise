import { createWriteStream } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { ZipArchive } from 'archiver';
import type { FullConfig, FullResult, Reporter, Suite, TestCase, TestResult } from '@playwright/test/reporter';
import { ReportSheetWriter } from './ReportSheetWriter';

/**
 * Custom Playwright reporter that funnels every test result into a report
 * sheet. Registered alongside the built-in HTML reporter in playwright.config.ts.
 */
export default class ReportSheetReporter implements Reporter {
  private readonly writer = new ReportSheetWriter();
  private readonly outputPath = 'playwright-report/report-sheet.csv';
  private readonly artifactsDirectory = 'playwright-report';

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
    await this.archiveArtifacts();
  }

  private async archiveArtifacts(): Promise<void> {
    await mkdir(this.artifactsDirectory, { recursive: true });

    const timestamp = new Date().toISOString().replace('T', '_').replaceAll(':', '-').replace(/\.\d{3}Z$/, '');
    const outputPath = join(this.artifactsDirectory, `playwright-report-${timestamp}.zip`);
    const output = createWriteStream(outputPath);
    const archive = new ZipArchive({ zlib: { level: 9 } });

    const archiveComplete = new Promise<void>((resolve, reject) => {
      output.on('close', resolve);
      output.on('error', reject);
      archive.on('error', reject);
    });

    archive.pipe(output);
    archive.directory('playwright-report', 'playwright-report');
    archive.directory('test-results', 'test-results');
    await archive.finalize();
    await archiveComplete;
  }
}
