import { Injectable } from '@nestjs/common';
import { IDataExporter, ExportOptions, ExportResult } from '../../domain/interfaces/data-export.interface';

@Injectable()
export class JsonExportService implements IDataExporter {
  async export(data: any, options?: ExportOptions): Promise<ExportResult> {
    const json = JSON.stringify(data, null, 2);
    const filename = options?.filename || `export-${Date.now()}.json`;

    return {
      success: true,
      data: json,
      filename,
      mimeType: 'application/json',
      size: Buffer.byteLength(json, 'utf8'),
    };
  }
}

