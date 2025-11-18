import { Injectable, Logger } from '@nestjs/common';
import { createWorker, Worker } from 'tesseract.js';
import { MTG_DICTIONARY, COMMON_CORRECTIONS } from './mtg-dictionary';

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);
  private worker: Worker | null = null;

  async initializeWorker() {
    if (!this.worker) {
      this.logger.log('Inicializando worker do Tesseract...');
      this.worker = await createWorker('por+eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            this.logger.debug(`Progresso OCR: ${Math.round(m.progress * 100)}%`);
          }
        },
      });

      // Configurar parâmetros do Tesseract para melhorar reconhecimento em português
      await this.worker.setParameters({
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,;:!?()-áàâãéêíóôõúçÁÀÂÃÉÊÍÓÔÕÚÇ',
        tessedit_pageseg_mode: '6' as any, // Assume uniform block of text
        tessedit_ocr_engine_mode: '1' as any, // Neural nets LSTM engine only
        preserve_interword_spaces: '1',
        // Habilitar dicionários para melhor reconhecimento
        load_system_dawg: '1',
        load_freq_dawg: '1',
        load_punc_dawg: '1',
        load_number_dawg: '1',
        load_unambig_dawg: '1',
        load_bigram_dawg: '1',
        load_fixed_length_dawgs: '1',
        // Ajustar penalidades para palavras não-dicionário (mais permissivo)
        language_model_penalty_non_freq_dict_word: '0.3',
        language_model_penalty_non_dict_word: '0.3',
        // Configurações adicionais para melhorar reconhecimento
        tessedit_enable_dict_correction: '1',
        wordrec_enable_assoc: '1',
        // Configurar para reconhecer melhor palavras compostas
        segment_segcost_rating: '0.1',
        segment_penalty_dict_nonword: '0.1',
        segment_penalty_dict_frequent_word: '0.1',
        segment_penalty_dict_case_ok: '0.1',
        segment_penalty_dict_case_bad: '0.3125',
      });

      this.logger.log('Worker do Tesseract inicializado com sucesso (otimizado para português)');
    }
    return this.worker;
  }

  async extractTextFromImage(imageBase64: string): Promise<{
    text: string;
    confidence: number;
    title?: string;
  }> {
    try {
      const worker = await this.initializeWorker();

      // Remove o prefixo data:image/...;base64, se existir
      const base64Data = imageBase64.includes(',')
        ? imageBase64.split(',')[1]
        : imageBase64;

      this.logger.log('Processando imagem com OCR...');

      const {
        data: { text, confidence },
      } = await worker.recognize(Buffer.from(base64Data, 'base64'), {
        rectangle: undefined, // Processar imagem inteira
      });

      this.logger.log(`OCR concluído. Confiança: ${confidence}%`);

      // Aplicar pós-processamento para melhorar o texto
      const processedText = this.postProcessText(text);

      // Extrai o título (primeiras linhas do texto)
      const lines = processedText.split('\n').filter((line) => line.trim().length > 0);
      const title = this.extractTitle(lines);

      return {
        text: processedText.trim(),
        confidence: Math.round(confidence),
        title: title || undefined,
      };
    } catch (error) {
      this.logger.error('Erro ao processar OCR:', error);
      throw new Error('Falha ao processar imagem com OCR');
    }
  }

  /**
   * Aplica pós-processamento no texto extraído para corrigir erros comuns do OCR
   */
  private postProcessText(text: string): string {
    let processed = text;

    // Aplicar correções comuns
    Object.entries(COMMON_CORRECTIONS).forEach(([wrong, correct]) => {
      const regex = new RegExp(wrong, 'gi');
      processed = processed.replace(regex, correct);
    });

    // Corrigir espaços múltiplos
    processed = processed.replace(/\s+/g, ' ');

    // Corrigir quebras de linha excessivas
    processed = processed.replace(/\n{3,}/g, '\n\n');

    // Remover caracteres de controle
    processed = processed.replace(/[\x00-\x1F\x7F]/g, '');

    // Tentar corrigir palavras usando o dicionário MTG
    processed = this.correctWordsWithDictionary(processed);

    return processed;
  }

  /**
   * Tenta corrigir palavras usando o dicionário MTG
   */
  private correctWordsWithDictionary(text: string): string {
    const words = text.split(/\s+/);
    const dictionaryLower = MTG_DICTIONARY.map((w) => w.toLowerCase());

    return words
      .map((word) => {
        const wordLower = word.toLowerCase().replace(/[^\w]/g, '');
        
        // Se a palavra está no dicionário, manter
        if (dictionaryLower.includes(wordLower)) {
          return word;
        }

        // Tentar encontrar palavra similar no dicionário (Levenshtein simples)
        const similar = this.findSimilarWord(wordLower, dictionaryLower);
        if (similar && this.levenshteinDistance(wordLower, similar) <= 2) {
          // Preservar capitalização original se possível
          if (word[0] && word[0] === word[0].toUpperCase()) {
            return similar.charAt(0).toUpperCase() + similar.slice(1);
          }
          return similar;
        }

        return word;
      })
      .join(' ');
  }

  /**
   * Encontra palavra similar no dicionário
   */
  private findSimilarWord(word: string, dictionary: string[]): string | null {
    let bestMatch: string | null = null;
    let bestDistance = Infinity;

    for (const dictWord of dictionary) {
      const distance = this.levenshteinDistance(word, dictWord);
      if (distance < bestDistance && distance <= 2) {
        bestDistance = distance;
        bestMatch = dictWord;
      }
    }

    return bestMatch;
  }

  /**
   * Calcula distância de Levenshtein entre duas strings
   */
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

  private extractTitle(lines: string[]): string | null {
    if (lines.length === 0) return null;

    // Pega as primeiras 3 linhas como possível título
    // Normalmente o título está no topo da imagem
    const possibleTitle = lines.slice(0, 3).join(' ').trim();

    // Remove caracteres especiais excessivos e limpa o texto
    const cleanedTitle = possibleTitle
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s\-.,;:()]/g, '')
      .trim();

    // Retorna se tiver pelo menos 3 caracteres
    return cleanedTitle.length >= 3 ? cleanedTitle : null;
  }

  async terminateWorker() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.logger.log('Worker do Tesseract finalizado');
    }
  }
}

