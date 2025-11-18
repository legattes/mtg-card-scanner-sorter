import { Injectable, Logger, Inject } from '@nestjs/common';
import { IDataRepository } from '../domain/interfaces/data-repository.interface';
import { OcrCalibrationResult } from '../domain/entities/ocr-calibration-result.entity';

/**
 * @deprecated Use CalibrationService from application/services instead
 * Mantido para compatibilidade durante migração
 */

@Injectable()
export class OcrCalibrationService {
  private readonly logger = new Logger(OcrCalibrationService.name);
  
  constructor(
    @Inject('IDataRepository')
    private readonly repository: IDataRepository,
  ) {}

  async saveCalibrationResult(result: OcrCalibrationResult): Promise<void> {
    await this.repository.save(new OcrCalibrationResult(result));
  }

  loadCalibrationResults(): OcrCalibrationResult[] {
    // Mantido para compatibilidade - usar repository diretamente
    return [];
  }

  async getCalibrationStats() {
    const results = await this.repository.findAll();
    
    if (results.length === 0) {
      return {
        total: 0,
        correct: 0,
        incorrect: 0,
        averageConfidence: 0,
        accuracy: 0,
      };
    }
    
    const correct = results.filter((r) => r.isCorrect).length;
    const incorrect = results.length - correct;
    const averageConfidence =
      results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
    const accuracy = (correct / results.length) * 100;
    
    return {
      total: results.length,
      correct,
      incorrect,
      averageConfidence: Math.round(averageConfidence * 100) / 100,
      accuracy: Math.round(accuracy * 100) / 100,
    };
  }

  async getIncorrectResults(limit: number = 10): Promise<OcrCalibrationResult[]> {
    return this.repository.findIncorrect(limit);
  }

  async updateCalibrationResult(
    id: string,
    updates: Partial<OcrCalibrationResult>
  ): Promise<void> {
    await this.repository.update(id, updates);
  }

  async cleanOldResults(daysOld: number = 30): Promise<number> {
    return this.repository.cleanOld(daysOld);
  }
}

