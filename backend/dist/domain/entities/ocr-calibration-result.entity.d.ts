export type FeedbackType = 'correct' | 'almostCorrect' | 'containsText' | 'incorrect';
export declare class OcrCalibrationResult {
    id?: string;
    expectedText: string;
    extractedText: string;
    confidence: number;
    imageBase64?: string;
    imageHash?: string;
    isCorrect: boolean;
    isAlmostCorrect?: boolean;
    containsText?: boolean;
    feedbackType?: FeedbackType;
    corrections?: string;
    timestamp: Date;
    parameters?: {
        contrast?: number;
        brightness?: number;
        threshold?: number;
    };
    constructor(data?: Partial<OcrCalibrationResult>);
    calculateDifference(): number;
    validate(): boolean;
    calculateSimilarity(): number;
    isAlmostCorrectCheck(): boolean;
    containsTextCheck(): boolean;
    private levenshteinDistance;
}
