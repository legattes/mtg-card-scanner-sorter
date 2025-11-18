import { OcrCalibrationResult } from '../../domain/entities/ocr-calibration-result.entity';

/**
 * Interface para repositório de dados
 * Permite trocar implementação (arquivo, banco de dados, etc.)
 */
export interface IDataRepository {
  /**
   * Salva um resultado de calibração
   */
  save(result: OcrCalibrationResult): Promise<void>;

  /**
   * Busca todos os resultados
   */
  findAll(): Promise<OcrCalibrationResult[]>;

  /**
   * Busca por ID
   */
  findById(id: string): Promise<OcrCalibrationResult | null>;

  /**
   * Atualiza um resultado
   */
  update(id: string, updates: Partial<OcrCalibrationResult>): Promise<void>;

  /**
   * Remove resultados antigos
   */
  cleanOld(daysOld: number): Promise<number>;

  /**
   * Busca resultados incorretos
   */
  findIncorrect(limit?: number): Promise<OcrCalibrationResult[]>;
}

