import { IDataExporter, ExportOptions, ExportResult } from '../../domain/interfaces/data-export.interface';
export declare class CsvExportService implements IDataExporter {
    export(data: any, options?: ExportOptions): Promise<ExportResult>;
    private escapeCsv;
}
