import { OcrCalibrationResult } from '../../domain/entities/ocr-calibration-result.entity';
export interface IDataRepository {
    save(result: OcrCalibrationResult): Promise<void>;
    findAll(): Promise<OcrCalibrationResult[]>;
    findById(id: string): Promise<OcrCalibrationResult | null>;
    update(id: string, updates: Partial<OcrCalibrationResult>): Promise<void>;
    cleanOld(daysOld: number): Promise<number>;
    findIncorrect(limit?: number): Promise<OcrCalibrationResult[]>;
}
