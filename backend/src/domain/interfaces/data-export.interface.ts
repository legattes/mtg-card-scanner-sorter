/**
 * Interface para exportação de dados
 */
export interface IDataExporter {
  /**
   * Exporta dados em um formato específico
   */
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

