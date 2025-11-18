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
var OcrController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OcrController = void 0;
const common_1 = require("@nestjs/common");
const ocr_service_1 = require("./ocr.service");
const ocr_calibration_service_1 = require("./ocr-calibration.service");
const ocr_calibration_result_entity_1 = require("../domain/entities/ocr-calibration-result.entity");
const calibration_service_1 = require("../application/services/calibration.service");
const export_service_1 = require("../application/services/export.service");
let OcrController = OcrController_1 = class OcrController {
    constructor(ocrService, calibrationService, calibrationAppService, exportService) {
        this.ocrService = ocrService;
        this.calibrationService = calibrationService;
        this.calibrationAppService = calibrationAppService;
        this.exportService = exportService;
        this.logger = new common_1.Logger(OcrController_1.name);
    }
    async processImage(body) {
        try {
            if (!body.image) {
                throw new common_1.HttpException('Imagem não fornecida', common_1.HttpStatus.BAD_REQUEST);
            }
            this.logger.log('Recebendo requisição de OCR...');
            this.logger.log(`ExpectedText recebido: "${body.expectedText}"`);
            this.logger.log(`SaveForCalibration: ${body.saveForCalibration}`);
            const result = await this.ocrService.extractTextFromImage(body.image);
            let calibrationId;
            const hasExpectedText = body.expectedText && body.expectedText.trim().length > 0;
            if (hasExpectedText || body.saveForCalibration) {
                this.logger.log('Salvando resultado para calibração...');
                const expectedText = body.expectedText?.trim() || result.text;
                const extractedText = result.text || '';
                const calibrationResult = new ocr_calibration_result_entity_1.OcrCalibrationResult({
                    expectedText: expectedText,
                    extractedText: extractedText,
                    confidence: result.confidence,
                    imageHash: this.hashImage(body.image),
                    isCorrect: hasExpectedText
                        ? expectedText.toLowerCase().trim() ===
                            extractedText.toLowerCase().trim()
                        : false,
                });
                this.logger.log(`Dados a serem salvos:`, {
                    expectedText: calibrationResult.expectedText,
                    extractedText: calibrationResult.extractedText,
                    confidence: calibrationResult.confidence,
                    isCorrect: calibrationResult.isCorrect,
                });
                try {
                    const saved = await this.calibrationAppService.saveResult(calibrationResult);
                    calibrationId = saved.id;
                    this.logger.log(`✅ Resultado salvo para calibração com sucesso! ID: ${calibrationId}`);
                }
                catch (error) {
                    this.logger.error(`❌ Erro ao salvar resultado de calibração:`, error);
                }
            }
            else {
                this.logger.log('⚠️ Resultado NÃO será salvo - expectedText não fornecido');
            }
            return {
                success: true,
                text: result.text,
                confidence: result.confidence,
                title: result.title,
                message: 'OCR processado com sucesso',
                calibrationId,
            };
        }
        catch (error) {
            this.logger.error('Erro ao processar OCR:', error);
            throw new common_1.HttpException({
                success: false,
                message: error.message || 'Erro ao processar imagem',
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getCalibrationStats() {
        return this.calibrationAppService.getStats();
    }
    async getStatsByExpectedText() {
        return this.calibrationAppService.getStatsByExpectedText();
    }
    async getIncorrectResults() {
        return this.calibrationAppService.getIncorrectResults(20);
    }
    async getAllResults() {
        return this.calibrationAppService.getAllResults();
    }
    async exportCalibrationData(format, filename) {
        const results = await this.calibrationAppService.getAllResults();
        const exportFormat = format || 'json';
        const exportFilename = filename || `calibration-export-${Date.now()}.${exportFormat}`;
        const exportResult = await this.exportService.exportData(results, {
            format: exportFormat,
            filename: exportFilename,
        });
        return {
            success: true,
            data: exportResult.data,
            filename: exportResult.filename,
            mimeType: exportResult.mimeType,
            size: exportResult.size,
        };
    }
    async updateCalibrationFeedback(id, feedback) {
        try {
            await this.calibrationAppService.updateFeedback(id, {
                isCorrect: feedback.isCorrect,
                isAlmostCorrect: feedback.isAlmostCorrect,
                containsText: feedback.containsText,
                feedbackType: feedback.feedbackType,
                expectedText: feedback.expectedText,
                corrections: feedback.corrections,
            });
            return {
                success: true,
                message: 'Feedback atualizado com sucesso',
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: error.message || 'Erro ao atualizar feedback',
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    hashImage(imageBase64) {
        const data = imageBase64.substring(0, 100);
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash;
        }
        return hash.toString(36);
    }
};
exports.OcrController = OcrController;
__decorate([
    (0, common_1.Post)('process'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OcrController.prototype, "processImage", null);
__decorate([
    (0, common_1.Get)('calibration/stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OcrController.prototype, "getCalibrationStats", null);
__decorate([
    (0, common_1.Get)('calibration/stats/by-text'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OcrController.prototype, "getStatsByExpectedText", null);
__decorate([
    (0, common_1.Get)('calibration/incorrect'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OcrController.prototype, "getIncorrectResults", null);
__decorate([
    (0, common_1.Get)('calibration/results'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OcrController.prototype, "getAllResults", null);
__decorate([
    (0, common_1.Get)('calibration/export'),
    __param(0, (0, common_1.Query)('format')),
    __param(1, (0, common_1.Query)('filename')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OcrController.prototype, "exportCalibrationData", null);
__decorate([
    (0, common_1.Patch)('calibration/:id/feedback'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OcrController.prototype, "updateCalibrationFeedback", null);
exports.OcrController = OcrController = OcrController_1 = __decorate([
    (0, common_1.Controller)('ocr'),
    __metadata("design:paramtypes", [ocr_service_1.OcrService,
        ocr_calibration_service_1.OcrCalibrationService,
        calibration_service_1.CalibrationService,
        export_service_1.ExportService])
], OcrController);
//# sourceMappingURL=ocr.controller.js.map