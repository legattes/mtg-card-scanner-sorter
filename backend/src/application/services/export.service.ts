import { Injectable } from '@nestjs/common';
import { IDataExporter } from '../../domain/interfaces/data-export.interface';
import { ExportOptions, ExportResult } from '../../domain/interfaces/data-export.interface';
import { JsonExportService } from '../../infrastructure/export/json-export.service';
import { CsvExportService } from '../../infrastructure/export/csv-export.service';

@Injectable()
export class ExportService {
  constructor(
    private readonly jsonExporter: JsonExportService,
    private readonly csvExporter: CsvExportService,
  ) {}

  async exportData(data: any, options: ExportOptions): Promise<ExportResult> {
    switch (options.format) {
      case 'json':
        return this.jsonExporter.export(data, options);
      case 'csv':
        return this.csvExporter.export(data, options);
      default:
        throw new Error(`Formato de exportação não suportado: ${options.format}`);
    }
  }
}

