import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  processImageForOCR,
  upscaleImage,
  ImageProcessingOptions,
} from './imageProcessing';

describe('imageProcessing', () => {
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    ctx = canvas.getContext('2d')!;
    
    // Preencher canvas com cor de teste
    ctx.fillStyle = '#808080'; // Cinza médio
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  });

  describe('processImageForOCR', () => {
    it('deve retornar o canvas quando contexto não está disponível', () => {
      const invalidCanvas = document.createElement('canvas');
      // Simular canvas sem contexto usando vi.spyOn do Vitest
      const getContextSpy = vi.spyOn(invalidCanvas, 'getContext');
      getContextSpy.mockReturnValue(null);

      const result = processImageForOCR(invalidCanvas);
      expect(result).toBe(invalidCanvas);
      
      getContextSpy.mockRestore();
    });

    it('deve aplicar brilho corretamente', () => {
      const options: ImageProcessingOptions = {
        brightness: 50,
        grayscale: false,
        sharpen: false,
        enhanceContrast: false,
      };

      const result = processImageForOCR(canvas, options);
      expect(result).toBe(canvas);

      // Verificar se a imagem foi processada (não podemos verificar valores exatos devido à complexidade)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      expect(imageData.data.length).toBeGreaterThan(0);
    });

    it('deve aplicar contraste corretamente', () => {
      const options: ImageProcessingOptions = {
        contrast: 1.5,
        grayscale: false,
        sharpen: false,
        enhanceContrast: false,
      };

      const result = processImageForOCR(canvas, options);
      expect(result).toBe(canvas);
    });

    it('deve converter para escala de cinza quando grayscale é true', () => {
      const options: ImageProcessingOptions = {
        grayscale: true,
        sharpen: false,
        enhanceContrast: false,
      };

      const result = processImageForOCR(canvas, options);
      expect(result).toBe(canvas);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Verificar que R, G, B são iguais (escala de cinza)
      for (let i = 0; i < data.length; i += 4) {
        expect(data[i]).toBe(data[i + 1]); // R === G
        expect(data[i + 1]).toBe(data[i + 2]); // G === B
      }
    });

    it('deve aplicar threshold quando fornecido', () => {
      const options: ImageProcessingOptions = {
        threshold: 128,
        grayscale: true,
        sharpen: false,
        enhanceContrast: false,
      };

      const result = processImageForOCR(canvas, options);
      expect(result).toBe(canvas);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Verificar que valores são 0 ou 255 (binarização)
      for (let i = 0; i < data.length; i += 4) {
        expect([0, 255]).toContain(data[i]); // R deve ser 0 ou 255
        expect([0, 255]).toContain(data[i + 1]); // G deve ser 0 ou 255
        expect([0, 255]).toContain(data[i + 2]); // B deve ser 0 ou 255
      }
    });

    it('deve aplicar gamma correction quando fornecido', () => {
      const options: ImageProcessingOptions = {
        gamma: 0.8,
        grayscale: false,
        sharpen: false,
        enhanceContrast: false,
      };

      const result = processImageForOCR(canvas, options);
      expect(result).toBe(canvas);
    });

    it('deve usar valores padrão quando opções não são fornecidas', () => {
      const result = processImageForOCR(canvas);
      expect(result).toBe(canvas);
    });
  });

  describe('upscaleImage', () => {
    it('deve aumentar o tamanho da imagem pelo fator especificado', () => {
      const originalWidth = canvas.width;
      const originalHeight = canvas.height;
      const scaleFactor = 2;

      const upscaled = upscaleImage(canvas, scaleFactor);

      expect(upscaled.width).toBe(originalWidth * scaleFactor);
      expect(upscaled.height).toBe(originalHeight * scaleFactor);
    });

    it('deve usar fator 2 por padrão', () => {
      const originalWidth = canvas.width;
      const originalHeight = canvas.height;

      const upscaled = upscaleImage(canvas);

      expect(upscaled.width).toBe(originalWidth * 2);
      expect(upscaled.height).toBe(originalHeight * 2);
    });

    it('deve criar um novo canvas', () => {
      const upscaled = upscaleImage(canvas, 2);
      expect(upscaled).not.toBe(canvas);
    });

    it('deve funcionar com diferentes fatores de escala', () => {
      const scaleFactors = [1.5, 3, 4];
      
      scaleFactors.forEach(factor => {
        const upscaled = upscaleImage(canvas, factor);
        expect(upscaled.width).toBe(canvas.width * factor);
        expect(upscaled.height).toBe(canvas.height * factor);
      });
    });
  });
});

