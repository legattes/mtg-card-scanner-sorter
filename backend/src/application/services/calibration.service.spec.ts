import { Test, TestingModule } from '@nestjs/testing';
import { CalibrationService } from './calibration.service';
import { IDataRepository } from '../../domain/interfaces/data-repository.interface';
import { OcrCalibrationResult } from '../../domain/entities/ocr-calibration-result.entity';

describe('CalibrationService', () => {
  let service: CalibrationService;
  let mockRepository: jest.Mocked<IDataRepository>;

  beforeEach(async () => {
    // Mock do repositório
    mockRepository = {
      save: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findIncorrect: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CalibrationService,
        {
          provide: 'IDataRepository',
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CalibrationService>(CalibrationService);
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
  });

  describe('saveResult', () => {
    it('deve salvar resultado correto e definir feedbackType como "correct"', async () => {
      const result = new OcrCalibrationResult({
        expectedText: 'Profundezas do Desejo',
        extractedText: 'Profundezas do Desejo',
        confidence: 95,
      });

      mockRepository.save.mockResolvedValue(undefined);

      const saved = await service.saveResult(result);

      expect(saved.isCorrect).toBe(true);
      expect(saved.feedbackType).toBe('correct');
      expect(mockRepository.save).toHaveBeenCalledWith(saved);
    });

    it('deve salvar resultado quase correto e definir feedbackType como "almostCorrect"', async () => {
      const result = new OcrCalibrationResult({
        expectedText: 'Profundezas do Desejo',
        extractedText: 'Profundezas do Desejo', // 91% similaridade (1 caractere diferente)
        confidence: 90,
      });

      // Simular texto quase correto (91% similaridade)
      result.extractedText = 'Profundezas do Desej0'; // O último caractere diferente

      mockRepository.save.mockResolvedValue(undefined);

      const saved = await service.saveResult(result);

      expect(saved.isAlmostCorrect).toBe(true);
      expect(saved.feedbackType).toBe('almostCorrect');
      expect(mockRepository.save).toHaveBeenCalledWith(saved);
    });

    it('deve salvar resultado que contém o texto e definir feedbackType como "containsText"', async () => {
      const result = new OcrCalibrationResult({
        expectedText: 'Profundezas',
        extractedText: 'Profundezas do Desejo e mais texto',
        confidence: 85,
      });

      mockRepository.save.mockResolvedValue(undefined);

      const saved = await service.saveResult(result);

      expect(saved.containsText).toBe(true);
      expect(saved.feedbackType).toBe('containsText');
      expect(mockRepository.save).toHaveBeenCalledWith(saved);
    });

    it('deve salvar resultado incorreto e definir feedbackType como "incorrect"', async () => {
      const result = new OcrCalibrationResult({
        expectedText: 'Profundezas do Desejo',
        extractedText: 'Texto completamente diferente',
        confidence: 50,
      });

      mockRepository.save.mockResolvedValue(undefined);

      const saved = await service.saveResult(result);

      expect(saved.isCorrect).toBe(false);
      expect(saved.feedbackType).toBe('incorrect');
      expect(mockRepository.save).toHaveBeenCalledWith(saved);
    });
  });

  describe('getStats', () => {
    it('deve retornar estatísticas vazias quando não há resultados', async () => {
      mockRepository.findAll.mockResolvedValue([]);

      const stats = await service.getStats();

      expect(stats).toEqual({
        total: 0,
        correct: 0,
        almostCorrect: 0,
        containsText: 0,
        incorrect: 0,
        averageConfidence: 0,
        accuracy: 0,
        almostCorrectRate: 0,
        containsTextRate: 0,
      });
    });

    it('deve calcular estatísticas corretamente', async () => {
      const results: OcrCalibrationResult[] = [
        new OcrCalibrationResult({
          expectedText: 'Texto 1',
          extractedText: 'Texto 1',
          confidence: 95,
          isCorrect: true,
          feedbackType: 'correct',
        }),
        new OcrCalibrationResult({
          expectedText: 'Texto 2',
          extractedText: 'Texto 2',
          confidence: 92,
          isCorrect: true,
          feedbackType: 'correct',
        }),
        new OcrCalibrationResult({
          expectedText: 'Texto 3',
          extractedText: 'Texto 3',
          confidence: 88,
          isAlmostCorrect: true,
          feedbackType: 'almostCorrect',
        }),
        new OcrCalibrationResult({
          expectedText: 'Texto 4',
          extractedText: 'Texto 4 e mais',
          confidence: 80,
          containsText: true,
          feedbackType: 'containsText',
        }),
        new OcrCalibrationResult({
          expectedText: 'Texto 5',
          extractedText: 'Diferente',
          confidence: 50,
          feedbackType: 'incorrect',
        }),
      ];

      mockRepository.findAll.mockResolvedValue(results);

      const stats = await service.getStats();

      expect(stats.total).toBe(5);
      expect(stats.correct).toBe(2);
      expect(stats.almostCorrect).toBe(1);
      expect(stats.containsText).toBe(1);
      expect(stats.incorrect).toBe(1);
      expect(stats.averageConfidence).toBe(81);
      expect(stats.accuracy).toBe(40); // 2/5 * 100
      expect(stats.almostCorrectRate).toBe(20); // 1/5 * 100
      expect(stats.containsTextRate).toBe(20); // 1/5 * 100
    });
  });

  describe('getStatsByExpectedText', () => {
    it('deve agrupar estatísticas por texto esperado', async () => {
      const results: OcrCalibrationResult[] = [
        new OcrCalibrationResult({
          expectedText: 'Profundezas do Desejo',
          extractedText: 'Profundezas do Desejo',
          confidence: 95,
          isCorrect: true,
          feedbackType: 'correct',
        }),
        new OcrCalibrationResult({
          expectedText: 'Profundezas do Desejo',
          extractedText: 'Profundezas do Desejo',
          confidence: 90,
          isCorrect: true,
          feedbackType: 'correct',
        }),
        new OcrCalibrationResult({
          expectedText: 'Outra Carta',
          extractedText: 'Outra Carta',
          confidence: 88,
          isCorrect: true,
          feedbackType: 'correct',
        }),
      ];

      mockRepository.findAll.mockResolvedValue(results);

      const stats = await service.getStatsByExpectedText();

      expect(stats).toHaveLength(2);
      expect(stats[0].expectedText).toBe('Profundezas do Desejo');
      expect(stats[0].total).toBe(2);
      expect(stats[0].correct).toBe(2);
      expect(stats[1].expectedText).toBe('Outra Carta');
      expect(stats[1].total).toBe(1);
    });
  });

  describe('updateFeedback', () => {
    it('deve atualizar feedback usando feedbackType', async () => {
      mockRepository.update.mockResolvedValue(undefined);

      await service.updateFeedback('test-id', {
        feedbackType: 'correct',
      });

      expect(mockRepository.update).toHaveBeenCalledWith('test-id', {
        isCorrect: true,
        isAlmostCorrect: false,
        containsText: false,
        feedbackType: 'correct',
      });
    });

    it('deve atualizar feedback com campos específicos', async () => {
      mockRepository.update.mockResolvedValue(undefined);

      await service.updateFeedback('test-id', {
        expectedText: 'Novo Texto',
        corrections: 'Correção aplicada',
      });

      expect(mockRepository.update).toHaveBeenCalledWith('test-id', {
        expectedText: 'Novo Texto',
        corrections: 'Correção aplicada',
      });
    });
  });
});

