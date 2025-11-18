import { Injectable, Logger, Inject } from '@nestjs/common';
import { IDataRepository } from '../../domain/interfaces/data-repository.interface';
import { OcrCalibrationResult } from '../../domain/entities/ocr-calibration-result.entity';

@Injectable()
export class CalibrationService {
  private readonly logger = new Logger(CalibrationService.name);

  constructor(
    @Inject('IDataRepository')
    private readonly repository: IDataRepository,
  ) {}

  async saveResult(result: OcrCalibrationResult): Promise<OcrCalibrationResult> {
    // Validar antes de salvar
    result.isCorrect = result.validate();
    result.isAlmostCorrect = result.isAlmostCorrectCheck();
    result.containsText = result.containsTextCheck();
    
    // Definir feedbackType baseado na validação
    if (result.isCorrect) {
      result.feedbackType = 'correct';
    } else if (result.isAlmostCorrect) {
      result.feedbackType = 'almostCorrect';
    } else if (result.containsText) {
      result.feedbackType = 'containsText';
    } else {
      result.feedbackType = 'incorrect';
    }
    
    await this.repository.save(result);
    return result;
  }

  async getStats(): Promise<{
    total: number;
    correct: number;
    almostCorrect: number;
    containsText: number;
    incorrect: number;
    averageConfidence: number;
    accuracy: number;
    almostCorrectRate: number;
    containsTextRate: number;
  }> {
    const results = await this.repository.findAll();
    
    if (results.length === 0) {
      return {
        total: 0,
        correct: 0,
        almostCorrect: 0,
        containsText: 0,
        incorrect: 0,
        averageConfidence: 0,
        accuracy: 0,
        almostCorrectRate: 0,
        containsTextRate: 0,
      };
    }
    
    const correct = results.filter((r) => r.isCorrect).length;
    const almostCorrect = results.filter((r) => r.isAlmostCorrect && !r.isCorrect).length;
    const containsText = results.filter((r) => r.containsText && !r.isCorrect && !r.isAlmostCorrect).length;
    const incorrect = results.length - correct - almostCorrect - containsText;
    const averageConfidence =
      results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
    const accuracy = (correct / results.length) * 100;
    const almostCorrectRate = (almostCorrect / results.length) * 100;
    const containsTextRate = (containsText / results.length) * 100;
    
    return {
      total: results.length,
      correct,
      almostCorrect,
      containsText,
      incorrect,
      averageConfidence: Math.round(averageConfidence * 100) / 100,
      accuracy: Math.round(accuracy * 100) / 100,
      almostCorrectRate: Math.round(almostCorrectRate * 100) / 100,
      containsTextRate: Math.round(containsTextRate * 100) / 100,
    };
  }

  /**
   * Obtém estatísticas agrupadas por texto esperado
   */
  async getStatsByExpectedText(): Promise<
    Array<{
      expectedText: string;
      total: number;
      correct: number;
      almostCorrect: number;
      incorrect: number;
      accuracy: number;
      averageConfidence: number;
    }>
  > {
    const results = await this.repository.findAll();
    
    // Agrupar por expectedText
    const grouped = results.reduce((acc, result) => {
      const key = result.expectedText.trim().toLowerCase();
      if (!acc[key]) {
        acc[key] = {
          expectedText: result.expectedText.trim(),
          results: [],
        };
      }
      acc[key].results.push(result);
      return acc;
    }, {} as Record<string, { expectedText: string; results: OcrCalibrationResult[] }>);

    // Calcular estatísticas para cada grupo
    return Object.values(grouped).map((group) => {
      const total = group.results.length;
      const correct = group.results.filter((r) => r.isCorrect).length;
      const almostCorrect = group.results.filter((r) => r.isAlmostCorrect && !r.isCorrect).length;
      const containsText = group.results.filter((r) => r.containsText && !r.isCorrect && !r.isAlmostCorrect).length;
      const incorrect = total - correct - almostCorrect - containsText;
      const accuracy = total > 0 ? (correct / total) * 100 : 0;
      const averageConfidence =
        group.results.reduce((sum, r) => sum + r.confidence, 0) / total;

      return {
        expectedText: group.expectedText,
        total,
        correct,
        almostCorrect,
        containsText,
        incorrect,
        accuracy: Math.round(accuracy * 100) / 100,
        averageConfidence: Math.round(averageConfidence * 100) / 100,
      };
    }).sort((a, b) => b.total - a.total); // Ordenar por total (mais frequente primeiro)
  }

  async getIncorrectResults(limit: number = 10): Promise<OcrCalibrationResult[]> {
    return this.repository.findIncorrect(limit);
  }

  async updateFeedback(
    id: string,
    feedback: { 
      isCorrect?: boolean; 
      isAlmostCorrect?: boolean;
      containsText?: boolean;
      feedbackType?: 'correct' | 'almostCorrect' | 'containsText' | 'incorrect';
      expectedText?: string; 
      corrections?: string;
    }
  ): Promise<void> {
    // Se feedbackType foi fornecido, atualizar flags correspondentes
    if (feedback.feedbackType) {
      feedback.isCorrect = feedback.feedbackType === 'correct';
      feedback.isAlmostCorrect = feedback.feedbackType === 'almostCorrect';
      feedback.containsText = feedback.feedbackType === 'containsText';
    }
    
    await this.repository.update(id, feedback);
  }

  async getAllResults(): Promise<OcrCalibrationResult[]> {
    return this.repository.findAll();
  }
}

