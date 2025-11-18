import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Entidade de domínio para resultado de calibração OCR
 */
export type FeedbackType = 'correct' | 'almostCorrect' | 'containsText' | 'incorrect';

export class OcrCalibrationResult {
  @ApiPropertyOptional({
    description: 'ID único do resultado',
    example: '1234567890-abc123',
  })
  id?: string;

  @ApiProperty({
    description: 'Texto esperado para calibração',
    example: 'Profundezas do Desejo',
  })
  expectedText: string;

  @ApiProperty({
    description: 'Texto extraído pelo OCR',
    example: 'Profundezas do Desejo',
  })
  extractedText: string;

  @ApiProperty({
    description: 'Nível de confiança do OCR (0-100)',
    example: 95.5,
    minimum: 0,
    maximum: 100,
  })
  confidence: number;

  @ApiPropertyOptional({
    description: 'Imagem em Base64 (não incluída por padrão para economizar espaço)',
  })
  imageBase64?: string;

  @ApiPropertyOptional({
    description: 'Hash da imagem para evitar duplicatas',
    example: 'abc123def456',
  })
  imageHash?: string;

  @ApiProperty({
    description: 'Indica se o resultado está correto',
    example: true,
  })
  isCorrect: boolean;

  @ApiPropertyOptional({
    description: 'Indica se o resultado está quase correto (>90% similaridade)',
    example: false,
  })
  isAlmostCorrect?: boolean; // >90% de similaridade

  @ApiPropertyOptional({
    description: 'Indica se o texto extraído contém o texto esperado',
    example: false,
  })
  containsText?: boolean; // Texto extraído contém o texto esperado

  @ApiPropertyOptional({
    description: 'Tipo de feedback dado',
    enum: ['correct', 'almostCorrect', 'containsText', 'incorrect'],
    example: 'correct',
  })
  feedbackType?: FeedbackType; // Tipo de feedback dado

  @ApiPropertyOptional({
    description: 'Correções ou observações sobre o resultado',
    example: 'Texto estava quase correto, apenas um caractere diferente',
  })
  corrections?: string;

  @ApiProperty({
    description: 'Data e hora do processamento',
    example: '2024-01-01T00:00:00.000Z',
  })
  timestamp: Date;

  @ApiPropertyOptional({
    description: 'Parâmetros de processamento de imagem usados',
    example: {
      contrast: 1.6,
      brightness: 5,
      threshold: 128,
    },
  })
  parameters?: {
    contrast?: number;
    brightness?: number;
    threshold?: number;
  };

  constructor(data: Partial<OcrCalibrationResult> = {}) {
    this.id = data.id;
    this.expectedText = data.expectedText || '';
    this.extractedText = data.extractedText || '';
    this.confidence = data.confidence || 0;
    this.imageBase64 = data.imageBase64;
    this.imageHash = data.imageHash;
    this.isCorrect = data.isCorrect ?? false;
    this.isAlmostCorrect = data.isAlmostCorrect ?? false;
    this.containsText = data.containsText ?? false;
    this.feedbackType = data.feedbackType;
    this.corrections = data.corrections;
    this.timestamp = data.timestamp || new Date();
    this.parameters = data.parameters;
  }

  /**
   * Calcula a diferença entre texto esperado e extraído
   */
  calculateDifference(): number {
    const expected = this.expectedText.toLowerCase().trim();
    const extracted = this.extractedText.toLowerCase().trim();
    
    if (expected === extracted) return 0;
    
    // Distância de Levenshtein simples
    return this.levenshteinDistance(expected, extracted);
  }

  /**
   * Verifica se o resultado está correto
   */
  validate(): boolean {
    const expected = this.expectedText.toLowerCase().trim();
    const extracted = this.extractedText.toLowerCase().trim();
    return expected === extracted;
  }

  /**
   * Calcula a porcentagem de similaridade entre texto esperado e extraído
   */
  calculateSimilarity(): number {
    const expected = this.expectedText.toLowerCase().trim();
    const extracted = this.extractedText.toLowerCase().trim();
    
    if (expected === extracted) return 100;
    if (expected.length === 0 || extracted.length === 0) return 0;
    
    const distance = this.levenshteinDistance(expected, extracted);
    const maxLength = Math.max(expected.length, extracted.length);
    const similarity = ((maxLength - distance) / maxLength) * 100;
    
    return Math.round(similarity * 100) / 100;
  }

  /**
   * Verifica se está quase correto (>90% de similaridade)
   */
  isAlmostCorrectCheck(): boolean {
    return this.calculateSimilarity() >= 90;
  }

  /**
   * Verifica se o texto extraído contém o texto esperado
   */
  containsTextCheck(): boolean {
    const expected = this.expectedText.toLowerCase().trim();
    const extracted = this.extractedText.toLowerCase().trim();
    
    if (expected.length === 0) return false;
    
    // Verifica se o texto extraído contém o texto esperado
    return extracted.includes(expected);
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[str2.length][str1.length];
  }
}

