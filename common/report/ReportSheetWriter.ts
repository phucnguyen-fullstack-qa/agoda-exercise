import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

export interface ReportSheetRow {
    suiteName: string;
    testName: string;
    status: 'passed' | 'failed' | 'timedOut' | 'skipped' | 'interrupted';
    durationMs: number;
    errorMessage?: string;
}

const reportSheetColumns = ['suiteName', 'testName', 'status', 'durationMs', 'errorMessage'] as const;

/**
 * Collects test results in memory and hands them off to a report sheet.
 * For now this just writes a local CSV; swap `flush` for a Google Sheets /
 * Excel export later without touching call sites.
 */
export class ReportSheetWriter {
    private readonly rows: ReportSheetRow[] = [];

    addRow(row: ReportSheetRow): void {
        this.rows.push(row);
    }

    getRows(): readonly ReportSheetRow[] {
        return this.rows;
    }

    async flush(outputPath: string): Promise<void> {
        const escapeCell = (value: string | number | undefined): string => {
            const cell = String(value ?? '');
            return /[",\r\n]/.test(cell) ? `"${cell.replaceAll('"', '""')}"` : cell;
        };
        const content = [reportSheetColumns.join(','), ...this.rows.map((row) => reportSheetColumns.map((column) => escapeCell(row[column])).join(','))].join(
            '\n',
        );

        await mkdir(dirname(outputPath), { recursive: true });
        await writeFile(outputPath, `${content}\n`, 'utf8');
    }
}
