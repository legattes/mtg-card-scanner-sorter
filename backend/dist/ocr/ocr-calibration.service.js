"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var OcrCalibrationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OcrCalibrationService = void 0;
const common_1 = require("@nestjs/common");
const ocr_calibration_result_entity_1 = require("../domain/entities/ocr-calibration-result.entity");
let OcrCalibrationService = OcrCalibrationService_1 = class OcrCalibrationService {
    constructor(repository) {
        this.repository = repository;
        this.logger = new common_1.Logger(OcrCalibrationService_1.name);
    }
    async saveCalibrationResult(result) {
        await this.repository.save(new ocr_calibration_result_entity_1.OcrCalibrationResult(result));
    }
    loadCalibrationResults() {
        return [];
    }
    async getCalibrationStats() {
        const results = await this.repository.findAll();
        if (results.length === 0) {
            return {
                total: 0,
                correct: 0,
                incorrect: 0,
                averageConfidence: 0,
                accuracy: 0,
            };
        }
        const correct = results.filter((r) => r.isCorrect).length;
        const incorrect = results.length - correct;
        const averageConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
        const accuracy = (correct / results.length) * 100;
        return {
            total: results.length,
            correct,
            incorrect,
            averageConfidence: Math.round(averageConfidence * 100) / 100,
            accuracy: Math.round(accuracy * 100) / 100,
        };
    }
    async getIncorrectResults(limit = 10) {
        return this.repository.findIncorrect(limit);
    }
    async updateCalibrationResult(id, updates) {
        await this.repository.update(id, updates);
    }
    async cleanOldResults(daysOld = 30) {
        return this.repository.cleanOld(daysOld);
    }
};
exports.OcrCalibrationService = OcrCalibrationService;
exports.OcrCalibrationService = OcrCalibrationService = OcrCalibrationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('IDataRepository')),
    __metadata("design:paramtypes", [Object])
], OcrCalibrationService);
//# sourceMappingURL=ocr-calibration.service.js.map