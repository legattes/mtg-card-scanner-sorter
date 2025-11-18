import { Worker } from 'tesseract.js';
export declare class OcrService {
    private readonly logger;
    private worker;
    initializeWorker(): Promise<Worker>;
    extractTextFromImage(imageBase64: string): Promise<{
        text: string;
        confidence: number;
        title?: string;
    }>;
    private postProcessText;
    private correctWordsWithDictionary;
    private findSimilarWord;
    private levenshteinDistance;
    private extractTitle;
    terminateWorker(): Promise<void>;
}
