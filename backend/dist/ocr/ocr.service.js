"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var OcrService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OcrService = void 0;
const common_1 = require("@nestjs/common");
const tesseract_js_1 = require("tesseract.js");
const mtg_dictionary_1 = require("./mtg-dictionary");
let OcrService = OcrService_1 = class OcrService {
    constructor() {
        this.logger = new common_1.Logger(OcrService_1.name);
        this.worker = null;
    }
    async initializeWorker() {
        if (!this.worker) {
            this.logger.log('Inicializando worker do Tesseract...');
            this.worker = await (0, tesseract_js_1.createWorker)('por+eng', 1, {
                logger: (m) => {
                    if (m.status === 'recognizing text') {
                        this.logger.debug(`Progresso OCR: ${Math.round(m.progress * 100)}%`);
                    }
                },
            });
            await this.worker.setParameters({
                tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,;:!?()-áàâãéêíóôõúçÁÀÂÃÉÊÍÓÔÕÚÇ',
                tessedit_pageseg_mode: '6',
                tessedit_ocr_engine_mode: '1',
                preserve_interword_spaces: '1',
                load_system_dawg: '1',
                load_freq_dawg: '1',
                load_punc_dawg: '1',
                load_number_dawg: '1',
                load_unambig_dawg: '1',
                load_bigram_dawg: '1',
                load_fixed_length_dawgs: '1',
                language_model_penalty_non_freq_dict_word: '0.3',
                language_model_penalty_non_dict_word: '0.3',
                tessedit_enable_dict_correction: '1',
                wordrec_enable_assoc: '1',
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
    async extractTextFromImage(imageBase64) {
        try {
            const worker = await this.initializeWorker();
            const base64Data = imageBase64.includes(',')
                ? imageBase64.split(',')[1]
                : imageBase64;
            this.logger.log('Processando imagem com OCR...');
            const { data: { text, confidence }, } = await worker.recognize(Buffer.from(base64Data, 'base64'), {
                rectangle: undefined,
            });
            this.logger.log(`OCR concluído. Confiança: ${confidence}%`);
            const processedText = this.postProcessText(text);
            const lines = processedText.split('\n').filter((line) => line.trim().length > 0);
            const title = this.extractTitle(lines);
            return {
                text: processedText.trim(),
                confidence: Math.round(confidence),
                title: title || undefined,
            };
        }
        catch (error) {
            this.logger.error('Erro ao processar OCR:', error);
            throw new Error('Falha ao processar imagem com OCR');
        }
    }
    postProcessText(text) {
        let processed = text;
        Object.entries(mtg_dictionary_1.COMMON_CORRECTIONS).forEach(([wrong, correct]) => {
            const regex = new RegExp(wrong, 'gi');
            processed = processed.replace(regex, correct);
        });
        processed = processed.replace(/\s+/g, ' ');
        processed = processed.replace(/\n{3,}/g, '\n\n');
        processed = processed.replace(/[\x00-\x1F\x7F]/g, '');
        processed = this.correctWordsWithDictionary(processed);
        return processed;
    }
    correctWordsWithDictionary(text) {
        const words = text.split(/\s+/);
        const dictionaryLower = mtg_dictionary_1.MTG_DICTIONARY.map((w) => w.toLowerCase());
        return words
            .map((word) => {
            const wordLower = word.toLowerCase().replace(/[^\w]/g, '');
            if (dictionaryLower.includes(wordLower)) {
                return word;
            }
            const similar = this.findSimilarWord(wordLower, dictionaryLower);
            if (similar && this.levenshteinDistance(wordLower, similar) <= 2) {
                if (word[0] && word[0] === word[0].toUpperCase()) {
                    return similar.charAt(0).toUpperCase() + similar.slice(1);
                }
                return similar;
            }
            return word;
        })
            .join(' ');
    }
    findSimilarWord(word, dictionary) {
        let bestMatch = null;
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
    levenshteinDistance(str1, str2) {
        const matrix = [];
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
                }
                else {
                    matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
                }
            }
        }
        return matrix[str2.length][str1.length];
    }
    extractTitle(lines) {
        if (lines.length === 0)
            return null;
        const possibleTitle = lines.slice(0, 3).join(' ').trim();
        const cleanedTitle = possibleTitle
            .replace(/\s+/g, ' ')
            .replace(/[^\w\s\-.,;:()]/g, '')
            .trim();
        return cleanedTitle.length >= 3 ? cleanedTitle : null;
    }
    async terminateWorker() {
        if (this.worker) {
            await this.worker.terminate();
            this.worker = null;
            this.logger.log('Worker do Tesseract finalizado');
        }
    }
};
exports.OcrService = OcrService;
exports.OcrService = OcrService = OcrService_1 = __decorate([
    (0, common_1.Injectable)()
], OcrService);
//# sourceMappingURL=ocr.service.js.map