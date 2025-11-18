import { IDataRepository } from '../../domain/interfaces/data-repository.interface';
import { OcrCalibrationResult } from '../../domain/entities/ocr-calibration-result.entity';
export declare class CalibrationService {
    private readonly repository;
    private readonly logger;
    constructor(repository: IDataRepository);
    saveResult(result: OcrCalibrationResult): Promise<OcrCalibrationResult>;
    getStats(): Promise<{
        total: number;
        correct: number;
        almostCorrect: number;
        containsText: number;
        incorrect: number;
        averageConfidence: number;
        accuracy: number;
        almostCorrectRate: number;
        containsTextRate: number;
    }>;
    getStatsByExpectedText(): Promise<Array<{
        expectedText: string;
        total: number;
        correct: number;
        almostCorrect: number;
        incorrect: number;
        accuracy: number;
        averageConfidence: number;
    }>>;
    getIncorrectResults(limit?: number): Promise<OcrCalibrationResult[]>;
    updateFeedback(id: string, feedback: {
        isCorrect?: boolean;
        isAlmostCorrect?: boolean;
        containsText?: boolean;
        feedbackType?: 'correct' | 'almostCorrect' | 'containsText' | 'incorrect';
        expectedText?: string;
        corrections?: string;
    }): Promise<void>;
    getAllResults(): Promise<OcrCalibrationResult[]>;
}
