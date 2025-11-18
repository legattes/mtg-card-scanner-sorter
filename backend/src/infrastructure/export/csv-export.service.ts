import { Injectable } from '@nestjs/common';
import { IDataExporter, ExportOptions, ExportResult } from '../../domain/interfaces/data-export.interface';
import { OcrCalibrationResult } from '../../domain/entities/ocr-calibration-result.entity';

@Injectable()
export class CsvExportService implements IDataExporter {
  async export(data: any, options?: ExportOptions): Promise<ExportResult> {
    if (!Array.isArray(data)) {
      throw new Error('CSV export requires an array of data');
    }

    if (data.length === 0) {
      return {
        success: true,
        data: '',
        filename: options?.filename || `export-${Date.now()}.csv`,
        mimeType: 'text/csv',
        size: 0,
      };
    }

    // Headers
    const headers = [
      'ID',
      'Expected Text',
      'Extracted Text',
      'Confidence',
      'Is Correct',
      'Timestamp',
      'Corrections',
    ];

    // Rows
    const rows = data.map((item: OcrCalibrationResult) => [
      item.id || '',
      this.escapeCsv(item.expectedText),
      this.escapeCsv(item.extractedText),
      item.confidence.toString(),
      item.isCorrect ? 'Yes' : 'No',
      item.timestamp.toISOString(),
      this.escapeCsv(item.corrections || ''),
    ]);

    // Combine
    const csv = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    const filename = options?.filename || `export-${Date.now()}.csv`;

    return {
      success: true,
      data: csv,
      filename,
      mimeType: 'text/csv',
      size: Buffer.byteLength(csv, 'utf8'),
    };
  }

  private escapeCsv(value: string): string {
    if (!value) return '';
    // Escape quotes and wrap in quotes if contains comma or newline
    const escaped = value.replace(/"/g, '""');
    if (value.includes(',') || value.includes('\n') || value.includes('"')) {
      return `"${escaped}"`;
    }
    return escaped;
  }
}

