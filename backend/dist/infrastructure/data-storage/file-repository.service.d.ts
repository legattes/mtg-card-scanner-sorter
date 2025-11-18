import { IDataRepository } from '../../domain/interfaces/data-repository.interface';
import { OcrCalibrationResult } from '../../domain/entities/ocr-calibration-result.entity';
export declare class FileRepositoryService implements IDataRepository {
    private readonly logger;
    private readonly dataDir;
    private readonly dataFile;
    constructor();
    save(result: OcrCalibrationResult): Promise<void>;
    findAll(): Promise<OcrCalibrationResult[]>;
    findById(id: string): Promise<OcrCalibrationResult | null>;
    update(id: string, updates: Partial<OcrCalibrationResult>): Promise<void>;
    cleanOld(daysOld: number): Promise<number>;
    findIncorrect(limit?: number): Promise<OcrCalibrationResult[]>;
}
