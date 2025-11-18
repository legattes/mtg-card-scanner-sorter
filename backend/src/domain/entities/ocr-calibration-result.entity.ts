/**
 * Entidade de domínio para resultado de calibração OCR
 */
export type FeedbackType = 'correct' | 'almostCorrect' | 'containsText' | 'incorrect';

export class OcrCalibrationResult {
  id?: string;
  expectedText: string;
  extractedText: string;
  confidence: number;
  imageBase64?: string;
  imageHash?: string;
  isCorrect: boolean;
  isAlmostCorrect?: boolean; // >90% de similaridade
  containsText?: boolean; // Texto extraído contém o texto esperado
  feedbackType?: FeedbackType; // Tipo de feedback dado
  corrections?: string;
  timestamp: Date;
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

