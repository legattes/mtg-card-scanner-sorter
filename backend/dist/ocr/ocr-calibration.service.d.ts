import { IDataRepository } from '../domain/interfaces/data-repository.interface';
import { OcrCalibrationResult } from '../domain/entities/ocr-calibration-result.entity';
export declare class OcrCalibrationService {
    private readonly repository;
    private readonly logger;
    constructor(repository: IDataRepository);
    saveCalibrationResult(result: OcrCalibrationResult): Promise<void>;
    loadCalibrationResults(): OcrCalibrationResult[];
    getCalibrationStats(): Promise<{
        total: number;
        correct: number;
        incorrect: number;
        averageConfidence: number;
        accuracy: number;
    }>;
    getIncorrectResults(limit?: number): Promise<OcrCalibrationResult[]>;
    updateCalibrationResult(id: string, updates: Partial<OcrCalibrationResult>): Promise<void>;
    cleanOldResults(daysOld?: number): Promise<number>;
}
