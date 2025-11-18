import { ExportOptions, ExportResult } from '../../domain/interfaces/data-export.interface';
import { JsonExportService } from '../../infrastructure/export/json-export.service';
import { CsvExportService } from '../../infrastructure/export/csv-export.service';
export declare class ExportService {
    private readonly jsonExporter;
    private readonly csvExporter;
    constructor(jsonExporter: JsonExportService, csvExporter: CsvExportService);
    exportData(data: any, options: ExportOptions): Promise<ExportResult>;
}
