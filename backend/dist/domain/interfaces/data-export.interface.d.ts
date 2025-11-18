export interface IDataExporter {
    export(data: any, options?: ExportOptions): Promise<ExportResult>;
}
export interface ExportOptions {
    format: 'json' | 'csv' | 'excel';
    filename?: string;
    includeImages?: boolean;
}
export interface ExportResult {
    success: boolean;
    data?: string | Buffer;
    filename: string;
    mimeType: string;
    size?: number;
}
