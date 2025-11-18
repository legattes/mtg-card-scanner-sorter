import { Module } from '@nestjs/common';
import { OcrController } from './ocr.controller';
import { OcrService } from './ocr.service';
import { OcrCalibrationService } from './ocr-calibration.service';
import { FileRepositoryService } from '../infrastructure/data-storage/file-repository.service';
import { CalibrationService } from '../application/services/calibration.service';
import { ExportService } from '../application/services/export.service';
import { JsonExportService } from '../infrastructure/export/json-export.service';
import { CsvExportService } from '../infrastructure/export/csv-export.service';

@Module({
  controllers: [OcrController],
  providers: [
    OcrService,
    OcrCalibrationService,
    // Repository
    {
      provide: 'IDataRepository',
      useClass: FileRepositoryService,
    },
    FileRepositoryService,
    // Application Services
    CalibrationService,
    ExportService,
    // Export Services
    JsonExportService,
    CsvExportService,
  ],
  exports: [
    OcrService,
    OcrCalibrationService,
    CalibrationService,
    ExportService,
  ],
})
export class OcrModule {}

