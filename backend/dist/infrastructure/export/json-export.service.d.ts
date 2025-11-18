import { IDataExporter, ExportOptions, ExportResult } from '../../domain/interfaces/data-export.interface';
export declare class JsonExportService implements IDataExporter {
    export(data: any, options?: ExportOptions): Promise<ExportResult>;
}
