"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OcrModule = void 0;
const common_1 = require("@nestjs/common");
const ocr_controller_1 = require("./ocr.controller");
const ocr_service_1 = require("./ocr.service");
const ocr_calibration_service_1 = require("./ocr-calibration.service");
const file_repository_service_1 = require("../infrastructure/data-storage/file-repository.service");
const calibration_service_1 = require("../application/services/calibration.service");
const export_service_1 = require("../application/services/export.service");
const json_export_service_1 = require("../infrastructure/export/json-export.service");
const csv_export_service_1 = require("../infrastructure/export/csv-export.service");
let OcrModule = class OcrModule {
};
exports.OcrModule = OcrModule;
exports.OcrModule = OcrModule = __decorate([
    (0, common_1.Module)({
        controllers: [ocr_controller_1.OcrController],
        providers: [
            ocr_service_1.OcrService,
            ocr_calibration_service_1.OcrCalibrationService,
            {
                provide: 'IDataRepository',
                useClass: file_repository_service_1.FileRepositoryService,
            },
            file_repository_service_1.FileRepositoryService,
            calibration_service_1.CalibrationService,
            export_service_1.ExportService,
            json_export_service_1.JsonExportService,
            csv_export_service_1.CsvExportService,
        ],
        exports: [
            ocr_service_1.OcrService,
            ocr_calibration_service_1.OcrCalibrationService,
            calibration_service_1.CalibrationService,
            export_service_1.ExportService,
        ],
    })
], OcrModule);
//# sourceMappingURL=ocr.module.js.map