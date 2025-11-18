import { Injectable, Logger } from '@nestjs/common';
import { IDataRepository } from '../../domain/interfaces/data-repository.interface';
import { OcrCalibrationResult } from '../../domain/entities/ocr-calibration-result.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FileRepositoryService implements IDataRepository {
  private readonly logger = new Logger(FileRepositoryService.name);
  private readonly dataDir = path.join(process.cwd(), 'data', 'calibration');
  private readonly dataFile = path.join(this.dataDir, 'ocr-calibration.json');

  constructor() {
    this.logger.log(`Inicializando FileRepository - Diretório: ${this.dataDir}`);
    this.logger.log(`Arquivo de dados: ${this.dataFile}`);
    
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
      this.logger.log(`Diretório criado: ${this.dataDir}`);
    } else {
      this.logger.log(`Diretório já existe: ${this.dataDir}`);
    }
  }

  async save(result: OcrCalibrationResult): Promise<void> {
    try {
      this.logger.log(`Tentando salvar resultado: ${JSON.stringify({
        expectedText: result.expectedText?.substring(0, 50),
        extractedText: result.extractedText?.substring(0, 50),
        confidence: result.confidence,
      })}`);
      
      const results = await this.findAll();
      this.logger.log(`Total de resultados existentes: ${results.length}`);
      
      if (!result.id) {
        result.id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }
      
      result.timestamp = new Date();
      
      // Converter para objeto simples para serialização JSON
      const resultToSave: any = {
        id: result.id,
        expectedText: result.expectedText || '',
        extractedText: result.extractedText || '',
        confidence: result.confidence || 0,
        imageHash: result.imageHash,
        isCorrect: result.isCorrect ?? false,
        corrections: result.corrections,
        timestamp: result.timestamp.toISOString(),
        parameters: result.parameters,
        // Não salvar imageBase64 para economizar espaço
      };
      
      results.push(new OcrCalibrationResult(resultToSave));
      
      // Converter todos os resultados para objetos simples antes de salvar
      const resultsToSave = results.map((r) => {
        // Garantir que timestamp seja um Date antes de converter
        const timestamp = r.timestamp instanceof Date 
          ? r.timestamp 
          : new Date(r.timestamp);
        
        return {
          id: r.id,
          expectedText: r.expectedText || '',
          extractedText: r.extractedText || '',
          confidence: r.confidence || 0,
          imageHash: r.imageHash,
          isCorrect: r.isCorrect ?? false,
          corrections: r.corrections,
          timestamp: timestamp.toISOString(),
          parameters: r.parameters,
        };
      });
      
      const jsonData = JSON.stringify(resultsToSave, null, 2);
      this.logger.log(`Salvando ${resultsToSave.length} resultados no arquivo: ${this.dataFile}`);
      
      fs.writeFileSync(
        this.dataFile,
        jsonData,
        'utf-8'
      );
      
      // Verificar se o arquivo foi criado
      if (fs.existsSync(this.dataFile)) {
        const stats = fs.statSync(this.dataFile);
        this.logger.log(`✅ Resultado salvo com sucesso! ID: ${result.id}, Tamanho do arquivo: ${stats.size} bytes`);
      } else {
        this.logger.error(`❌ Arquivo não foi criado: ${this.dataFile}`);
        throw new Error(`Falha ao criar arquivo: ${this.dataFile}`);
      }
    } catch (error) {
      this.logger.error('Erro ao salvar resultado:', error);
      this.logger.error(`Stack trace: ${error instanceof Error ? error.stack : 'N/A'}`);
      throw error;
    }
  }

  async findAll(): Promise<OcrCalibrationResult[]> {
    try {
      if (!fs.existsSync(this.dataFile)) {
        return [];
      }
      
      const data = fs.readFileSync(this.dataFile, 'utf-8');
      const results = JSON.parse(data);
      
      return results.map((r: any) => new OcrCalibrationResult({
        ...r,
        timestamp: new Date(r.timestamp),
        isAlmostCorrect: r.isAlmostCorrect ?? false,
        containsText: r.containsText ?? false,
        feedbackType: r.feedbackType,
      }));
    } catch (error) {
      this.logger.error('Erro ao carregar resultados:', error);
      return [];
    }
  }

  async findById(id: string): Promise<OcrCalibrationResult | null> {
    const results = await this.findAll();
    return results.find((r) => r.id === id) || null;
  }

  async update(id: string, updates: Partial<OcrCalibrationResult>): Promise<void> {
    const results = await this.findAll();
    const index = results.findIndex((r) => r.id === id);
    
    if (index === -1) {
      throw new Error(`Resultado não encontrado: ${id}`);
    }
    
    results[index] = new OcrCalibrationResult({ ...results[index], ...updates });
    
    // Converter todos os resultados para objetos simples antes de salvar
    const resultsToSave = results.map((r) => {
      // Garantir que timestamp seja um Date antes de converter
      const timestamp = r.timestamp instanceof Date 
        ? r.timestamp 
        : new Date(r.timestamp);
      
      return {
        id: r.id,
        expectedText: r.expectedText || '',
        extractedText: r.extractedText || '',
        confidence: r.confidence || 0,
        imageHash: r.imageHash,
        isCorrect: r.isCorrect ?? false,
        isAlmostCorrect: r.isAlmostCorrect ?? false,
        containsText: r.containsText ?? false,
        feedbackType: r.feedbackType,
        corrections: r.corrections,
        timestamp: timestamp.toISOString(),
        parameters: r.parameters,
      };
    });
    
    fs.writeFileSync(
      this.dataFile,
      JSON.stringify(resultsToSave, null, 2),
      'utf-8'
    );
    
    this.logger.log(`Resultado atualizado: ${id}`);
  }

  async cleanOld(daysOld: number): Promise<number> {
    const results = await this.findAll();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    const filtered = results.filter(
      (r) => r.timestamp.getTime() > cutoffDate.getTime()
    );
    
    const removed = results.length - filtered.length;
    
    if (removed > 0) {
      // Converter todos os resultados para objetos simples antes de salvar
      const resultsToSave = filtered.map((r) => {
        // Garantir que timestamp seja um Date antes de converter
        const timestamp = r.timestamp instanceof Date 
          ? r.timestamp 
          : new Date(r.timestamp);
        
        return {
          id: r.id,
          expectedText: r.expectedText || '',
          extractedText: r.extractedText || '',
          confidence: r.confidence || 0,
          imageHash: r.imageHash,
          isCorrect: r.isCorrect ?? false,
          corrections: r.corrections,
          timestamp: timestamp.toISOString(),
          parameters: r.parameters,
        };
      });
      
      fs.writeFileSync(
        this.dataFile,
        JSON.stringify(resultsToSave, null, 2),
        'utf-8'
      );
      this.logger.log(`Removidos ${removed} resultados antigos`);
    }
    
    return removed;
  }

  async findIncorrect(limit: number = 10): Promise<OcrCalibrationResult[]> {
    const results = await this.findAll();
    return results
      .filter((r) => !r.isCorrect)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }
}

