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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { OcrService } from './ocr.service';
import { OcrCalibrationService } from './ocr-calibration.service';
import { OcrCalibrationResult } from '../domain/entities/ocr-calibration-result.entity';
import { CalibrationService } from '../application/services/calibration.service';
import { ExportService } from '../application/services/export.service';
import { OcrRequestDto } from './dto/ocr-request.dto';
import { OcrResponseDto } from './dto/ocr-response.dto';
import { CalibrationFeedbackDto } from './dto/calibration-feedback.dto';
import { CalibrationStatsDto } from './dto/calibration-stats.dto';
import { StatsByTextDto } from './dto/stats-by-text.dto';
import { ExportResponseDto } from './dto/export-response.dto';

@ApiTags('OCR')
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
  @ApiOperation({
    summary: 'Processa imagem com OCR',
    description: 'Extrai texto de uma imagem usando OCR (Tesseract) e opcionalmente salva para calibração',
  })
  @ApiResponse({
    status: 200,
    description: 'OCR processado com sucesso',
    type: OcrResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Imagem não fornecida',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro ao processar imagem',
  })
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
  @ApiOperation({
    summary: 'Obtém estatísticas gerais de calibração',
    description: 'Retorna estatísticas agregadas de todos os resultados de calibração',
  })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas retornadas com sucesso',
    type: CalibrationStatsDto,
  })
  async getCalibrationStats(): Promise<CalibrationStatsDto> {
    return this.calibrationAppService.getStats();
  }

  /**
   * Obtém estatísticas agrupadas por texto esperado
   */
  @Get('calibration/stats/by-text')
  @ApiOperation({
    summary: 'Obtém estatísticas agrupadas por texto esperado',
    description: 'Retorna estatísticas agrupadas por cada texto esperado usado na calibração',
  })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas agrupadas retornadas com sucesso',
    type: [StatsByTextDto],
  })
  async getStatsByExpectedText(): Promise<StatsByTextDto[]> {
    return this.calibrationAppService.getStatsByExpectedText();
  }

  /**
   * Obtém resultados incorretos para análise
   */
  @Get('calibration/incorrect')
  @ApiOperation({
    summary: 'Obtém resultados incorretos',
    description: 'Retorna os últimos resultados incorretos para análise e melhoria',
  })
  @ApiResponse({
    status: 200,
    description: 'Resultados incorretos retornados com sucesso',
    type: [OcrCalibrationResult],
  })
  async getIncorrectResults(): Promise<OcrCalibrationResult[]> {
    return this.calibrationAppService.getIncorrectResults(20);
  }

  /**
   * Obtém todos os resultados de calibração
   */
  @Get('calibration/results')
  @ApiOperation({
    summary: 'Obtém todos os resultados de calibração',
    description: 'Retorna todos os resultados salvos para calibração',
  })
  @ApiResponse({
    status: 200,
    description: 'Resultados retornados com sucesso',
    type: [OcrCalibrationResult],
  })
  async getAllResults(): Promise<OcrCalibrationResult[]> {
    return this.calibrationAppService.getAllResults();
  }

  /**
   * Exporta dados de calibração
   */
  @Get('calibration/export')
  @ApiOperation({
    summary: 'Exporta dados de calibração',
    description: 'Exporta todos os dados de calibração em formato JSON ou CSV',
  })
  @ApiQuery({
    name: 'format',
    required: false,
    enum: ['json', 'csv'],
    description: 'Formato de exportação',
    example: 'json',
  })
  @ApiQuery({
    name: 'filename',
    required: false,
    description: 'Nome do arquivo (sem extensão)',
    example: 'calibration-export',
  })
  @ApiResponse({
    status: 200,
    description: 'Dados exportados com sucesso',
    type: ExportResponseDto,
  })
  async exportCalibrationData(
    @Query('format') format?: 'json' | 'csv',
    @Query('filename') filename?: string,
  ): Promise<ExportResponseDto> {
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
  @ApiOperation({
    summary: 'Atualiza feedback de calibração',
    description: 'Atualiza o feedback de um resultado específico de calibração',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do resultado de calibração',
    example: '1234567890-abc123',
  })
  @ApiResponse({
    status: 200,
    description: 'Feedback atualizado com sucesso',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Feedback atualizado com sucesso' },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Erro ao atualizar feedback',
  })
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

