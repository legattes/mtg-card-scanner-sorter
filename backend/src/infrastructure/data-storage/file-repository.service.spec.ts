import { FileRepositoryService } from './file-repository.service';
import { OcrCalibrationResult } from '../../domain/entities/ocr-calibration-result.entity';
import * as fs from 'fs';
import * as path from 'path';

// Mock do módulo fs
jest.mock('fs');
jest.mock('path');

describe('FileRepositoryService', () => {
  let service: FileRepositoryService;
  let mockFs: jest.Mocked<typeof fs>;
  let mockPath: jest.Mocked<typeof path>;

  beforeEach(() => {
    mockFs = fs as jest.Mocked<typeof fs>;
    mockPath = path as jest.Mocked<typeof path>;

    // Resetar mocks
    jest.clearAllMocks();

    // Configurar mocks padrão
    mockPath.join.mockImplementation((...args) => args.join('/'));
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue('[]');
    mockFs.writeFileSync.mockImplementation(() => {});
    mockFs.mkdirSync.mockImplementation(() => '');
    mockFs.statSync.mockReturnValue({ size: 100 } as fs.Stats);
  });

  it('deve ser definido', () => {
    service = new FileRepositoryService();
    expect(service).toBeDefined();
  });

  describe('save', () => {
    it('deve salvar um novo resultado', async () => {
      mockFs.readFileSync.mockReturnValue('[]');
      service = new FileRepositoryService();

      const result = new OcrCalibrationResult({
        expectedText: 'Teste',
        extractedText: 'Teste',
        confidence: 95,
      });

      await service.save(result);

      expect(mockFs.writeFileSync).toHaveBeenCalled();
      const writeCall = mockFs.writeFileSync.mock.calls[0];
      const savedData = JSON.parse(writeCall[1] as string);
      expect(savedData).toHaveLength(1);
      expect(savedData[0].expectedText).toBe('Teste');
    });

    it('deve adicionar a um arquivo existente', async () => {
      const existingData = [
        {
          id: '1',
          expectedText: 'Existente',
          extractedText: 'Existente',
          confidence: 90,
          timestamp: new Date().toISOString(),
        },
      ];
      mockFs.readFileSync.mockReturnValue(JSON.stringify(existingData));
      service = new FileRepositoryService();

      const result = new OcrCalibrationResult({
        expectedText: 'Novo',
        extractedText: 'Novo',
        confidence: 95,
      });

      await service.save(result);

      const writeCall = mockFs.writeFileSync.mock.calls[0];
      const savedData = JSON.parse(writeCall[1] as string);
      expect(savedData).toHaveLength(2);
    });

    it('deve gerar ID se não fornecido', async () => {
      mockFs.readFileSync.mockReturnValue('[]');
      service = new FileRepositoryService();

      const result = new OcrCalibrationResult({
        expectedText: 'Teste',
        extractedText: 'Teste',
        confidence: 95,
      });

      await service.save(result);

      const writeCall = mockFs.writeFileSync.mock.calls[0];
      const savedData = JSON.parse(writeCall[1] as string);
      expect(savedData[0].id).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('deve retornar array vazio quando arquivo não existe', async () => {
      mockFs.existsSync.mockReturnValue(false);
      service = new FileRepositoryService();

      const results = await service.findAll();

      expect(results).toEqual([]);
    });

    it('deve retornar todos os resultados', async () => {
      const data = [
        {
          id: '1',
          expectedText: 'Texto 1',
          extractedText: 'Texto 1',
          confidence: 95,
          timestamp: new Date().toISOString(),
        },
        {
          id: '2',
          expectedText: 'Texto 2',
          extractedText: 'Texto 2',
          confidence: 90,
          timestamp: new Date().toISOString(),
        },
      ];
      mockFs.readFileSync.mockReturnValue(JSON.stringify(data));
      service = new FileRepositoryService();

      const results = await service.findAll();

      expect(results).toHaveLength(2);
      expect(results[0].expectedText).toBe('Texto 1');
      expect(results[1].expectedText).toBe('Texto 2');
    });
  });

  describe('findById', () => {
    it('deve retornar resultado quando encontrado', async () => {
      const data = [
        {
          id: '1',
          expectedText: 'Texto 1',
          extractedText: 'Texto 1',
          confidence: 95,
          timestamp: new Date().toISOString(),
        },
      ];
      mockFs.readFileSync.mockReturnValue(JSON.stringify(data));
      service = new FileRepositoryService();

      const result = await service.findById('1');

      expect(result).toBeDefined();
      expect(result?.id).toBe('1');
    });

    it('deve retornar null quando não encontrado', async () => {
      mockFs.readFileSync.mockReturnValue('[]');
      service = new FileRepositoryService();

      const result = await service.findById('inexistente');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('deve atualizar resultado existente', async () => {
      const data = [
        {
          id: '1',
          expectedText: 'Texto Original',
          extractedText: 'Texto Original',
          confidence: 95,
          timestamp: new Date().toISOString(),
        },
      ];
      mockFs.readFileSync.mockReturnValue(JSON.stringify(data));
      service = new FileRepositoryService();

      await service.update('1', {
        expectedText: 'Texto Atualizado',
      });

      expect(mockFs.writeFileSync).toHaveBeenCalled();
      const writeCall = mockFs.writeFileSync.mock.calls[0];
      const savedData = JSON.parse(writeCall[1] as string);
      expect(savedData[0].expectedText).toBe('Texto Atualizado');
    });
  });

  describe('cleanOld', () => {
    it('deve remover resultados antigos', async () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 10);
      
      const data = [
        {
          id: '1',
          expectedText: 'Texto 1',
          extractedText: 'Texto 1',
          confidence: 95,
          timestamp: oldDate.toISOString(),
        },
        {
          id: '2',
          expectedText: 'Texto 2',
          extractedText: 'Texto 2',
          confidence: 90,
          timestamp: new Date().toISOString(),
        },
      ];
      mockFs.readFileSync.mockReturnValue(JSON.stringify(data));
      service = new FileRepositoryService();

      const removed = await service.cleanOld(5);

      expect(removed).toBe(1);
      const writeCall = mockFs.writeFileSync.mock.calls[0];
      const savedData = JSON.parse(writeCall[1] as string);
      expect(savedData).toHaveLength(1);
      expect(savedData[0].id).toBe('2');
    });
  });

  describe('findIncorrect', () => {
    it('deve retornar apenas resultados incorretos', async () => {
      const data = [
        {
          id: '1',
          expectedText: 'Texto 1',
          extractedText: 'Texto 1',
          confidence: 95,
          isCorrect: true,
          timestamp: new Date().toISOString(),
        },
        {
          id: '2',
          expectedText: 'Texto 2',
          extractedText: 'Diferente',
          confidence: 50,
          isCorrect: false,
          timestamp: new Date().toISOString(),
        },
      ];
      mockFs.readFileSync.mockReturnValue(JSON.stringify(data));
      service = new FileRepositoryService();

      const results = await service.findIncorrect(10);

      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('2');
    });

    it('deve limitar quantidade de resultados', async () => {
      const data = Array.from({ length: 20 }, (_, i) => ({
        id: `${i}`,
        expectedText: 'Texto',
        extractedText: 'Diferente',
        confidence: 50,
        isCorrect: false,
        timestamp: new Date().toISOString(),
      }));
      mockFs.readFileSync.mockReturnValue(JSON.stringify(data));
      service = new FileRepositoryService();

      const results = await service.findIncorrect(5);

      expect(results).toHaveLength(5);
    });
  });
});

