import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Query,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { OcrService } from './ocr.service';
import { OcrCalibrationService } from './ocr-calibration.service';
import { OcrCalibrationResult } from '../domain/entities/ocr-calibration-result.entity';
import { CalibrationService } from '../application/services/calibration.service';
import { ExportService } from '../application/services/export.service';

interface OcrRequestDto {
  image: string; // Base64 image
  expectedText?: string; // Texto esperado para calibração
  saveForCalibration?: boolean; // Se deve salvar para calibração
}

interface OcrResponseDto {
  success: boolean;
  text: string;
  confidence: number;
  title?: string;
  message?: string;
  calibrationId?: string; // ID do resultado salvo para calibração
}

interface CalibrationFeedbackDto {
  isCorrect?: boolean;
  isAlmostCorrect?: boolean;
  containsText?: boolean;
  feedbackType?: 'correct' | 'almostCorrect' | 'containsText' | 'incorrect';
  expectedText?: string;
  corrections?: string;
}

@Controller('ocr')
export class OcrController {
  private readonly logger = new Logger(OcrController.name);

  constructor(
    private readonly ocrService: OcrService,
    private readonly calibrationService: OcrCalibrationService,
    private readonly calibrationAppService: CalibrationService,
    private readonly exportService: ExportService,
  ) {}

  @Post('process')
  async processImage(
    @Body() body: OcrRequestDto,
  ): Promise<OcrResponseDto> {
    try {
      if (!body.image) {
        throw new HttpException(
          'Imagem não fornecida',
          HttpStatus.BAD_REQUEST,
        );
      }

      this.logger.log('Recebendo requisição de OCR...');
      this.logger.log(`ExpectedText recebido: "${body.expectedText}"`);
      this.logger.log(`SaveForCalibration: ${body.saveForCalibration}`);

      const result = await this.ocrService.extractTextFromImage(body.image);

      let calibrationId: string | undefined;

      // Salvar para calibração se expectedText estiver preenchido
      const hasExpectedText = body.expectedText && body.expectedText.trim().length > 0;
      
      if (hasExpectedText || body.saveForCalibration) {
        this.logger.log('Salvando resultado para calibração...');
        
        const expectedText = body.expectedText?.trim() || result.text;
        const extractedText = result.text || '';
        
        const calibrationResult = new OcrCalibrationResult({
          expectedText: expectedText,
          extractedText: extractedText,
          confidence: result.confidence,
          imageHash: this.hashImage(body.image),
          isCorrect: hasExpectedText
            ? expectedText.toLowerCase().trim() ===
              extractedText.toLowerCase().trim()
            : false,
        });

        this.logger.log(`Dados a serem salvos:`, {
          expectedText: calibrationResult.expectedText,
          extractedText: calibrationResult.extractedText,
          confidence: calibrationResult.confidence,
          isCorrect: calibrationResult.isCorrect,
        });

        try {
          const saved = await this.calibrationAppService.saveResult(calibrationResult);
          calibrationId = saved.id;
          this.logger.log(`✅ Resultado salvo para calibração com sucesso! ID: ${calibrationId}`);
        } catch (error) {
          this.logger.error(`❌ Erro ao salvar resultado de calibração:`, error);
          // Não falhar a requisição se o salvamento falhar, apenas logar
        }
      } else {
        this.logger.log('⚠️ Resultado NÃO será salvo - expectedText não fornecido');
      }

      return {
        success: true,
        text: result.text,
        confidence: result.confidence,
        title: result.title,
        message: 'OCR processado com sucesso',
        calibrationId,
      };
    } catch (error) {
      this.logger.error('Erro ao processar OCR:', error);
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Erro ao processar imagem',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Obtém estatísticas gerais de calibração
   */
  @Get('calibration/stats')
  async getCalibrationStats() {
    return this.calibrationAppService.getStats();
  }

  /**
   * Obtém estatísticas agrupadas por texto esperado
   */
  @Get('calibration/stats/by-text')
  async getStatsByExpectedText() {
    return this.calibrationAppService.getStatsByExpectedText();
  }

  /**
   * Obtém resultados incorretos para análise
   */
  @Get('calibration/incorrect')
  async getIncorrectResults() {
    return this.calibrationAppService.getIncorrectResults(20);
  }

  /**
   * Obtém todos os resultados de calibração
   */
  @Get('calibration/results')
  async getAllResults() {
    return this.calibrationAppService.getAllResults();
  }

  /**
   * Exporta dados de calibração
   */
  @Get('calibration/export')
  async exportCalibrationData(
    @Query('format') format?: 'json' | 'csv',
    @Query('filename') filename?: string,
  ) {
    const results = await this.calibrationAppService.getAllResults();
    const exportFormat = format || 'json';
    const exportFilename = filename || `calibration-export-${Date.now()}.${exportFormat}`;

    const exportResult = await this.exportService.exportData(results, {
      format: exportFormat,
      filename: exportFilename,
    });

    return {
      success: true,
      data: exportResult.data,
      filename: exportResult.filename,
      mimeType: exportResult.mimeType,
      size: exportResult.size,
    };
  }

  /**
   * Atualiza feedback de um resultado de calibração
   */
  @Patch('calibration/:id/feedback')
  async updateCalibrationFeedback(
    @Param('id') id: string,
    @Body() feedback: CalibrationFeedbackDto,
  ) {
    try {
      await this.calibrationAppService.updateFeedback(id, {
        isCorrect: feedback.isCorrect,
        isAlmostCorrect: feedback.isAlmostCorrect,
        containsText: feedback.containsText,
        feedbackType: feedback.feedbackType,
        expectedText: feedback.expectedText,
        corrections: feedback.corrections,
      });

      return {
        success: true,
        message: 'Feedback atualizado com sucesso',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Erro ao atualizar feedback',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Gera hash simples da imagem para evitar duplicatas
   */
  private hashImage(imageBase64: string): string {
    // Hash simples baseado no tamanho e primeiros bytes
    const data = imageBase64.substring(0, 100);
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  }
}

