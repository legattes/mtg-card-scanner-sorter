export interface OcrCalibrationResult {
    id?: string;
    expectedText: string;
    extractedText: string;
    confidence: number;
    imageBase64?: string;
    imageHash?: string;
    isCorrect: boolean;
    corrections?: string;
    timestamp: Date;
    parameters?: {
        contrast?: number;
        brightness?: number;
        threshold?: number;
    };
}
