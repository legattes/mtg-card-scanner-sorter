import { OcrService } from './ocr.service';
import { OcrCalibrationService } from './ocr-calibration.service';
import { OcrCalibrationResult } from '../domain/entities/ocr-calibration-result.entity';
import { CalibrationService } from '../application/services/calibration.service';
import { ExportService } from '../application/services/export.service';
interface OcrRequestDto {
    image: string;
    expectedText?: string;
    saveForCalibration?: boolean;
}
interface OcrResponseDto {
    success: boolean;
    text: string;
    confidence: number;
    title?: string;
    message?: string;
    calibrationId?: string;
}
interface CalibrationFeedbackDto {
    isCorrect?: boolean;
    isAlmostCorrect?: boolean;
    containsText?: boolean;
    feedbackType?: 'correct' | 'almostCorrect' | 'containsText' | 'incorrect';
    expectedText?: string;
    corrections?: string;
}
export declare class OcrController {
    private readonly ocrService;
    private readonly calibrationService;
    private readonly calibrationAppService;
    private readonly exportService;
    private readonly logger;
    constructor(ocrService: OcrService, calibrationService: OcrCalibrationService, calibrationAppService: CalibrationService, exportService: ExportService);
    processImage(body: OcrRequestDto): Promise<OcrResponseDto>;
    getCalibrationStats(): Promise<{
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
    getStatsByExpectedText(): Promise<{
        expectedText: string;
        total: number;
        correct: number;
        almostCorrect: number;
        incorrect: number;
        accuracy: number;
        averageConfidence: number;
    }[]>;
    getIncorrectResults(): Promise<OcrCalibrationResult[]>;
    getAllResults(): Promise<OcrCalibrationResult[]>;
    exportCalibrationData(format?: 'json' | 'csv', filename?: string): Promise<{
        success: boolean;
        data: string | Buffer<ArrayBufferLike>;
        filename: string;
        mimeType: string;
        size: number;
    }>;
    updateCalibrationFeedback(id: string, feedback: CalibrationFeedbackDto): Promise<{
        success: boolean;
        message: string;
    }>;
    private hashImage;
}
export {};
