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
var CalibrationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalibrationService = void 0;
const common_1 = require("@nestjs/common");
let CalibrationService = CalibrationService_1 = class CalibrationService {
    constructor(repository) {
        this.repository = repository;
        this.logger = new common_1.Logger(CalibrationService_1.name);
    }
    async saveResult(result) {
        result.isCorrect = result.validate();
        result.isAlmostCorrect = result.isAlmostCorrectCheck();
        result.containsText = result.containsTextCheck();
        if (result.isCorrect) {
            result.feedbackType = 'correct';
        }
        else if (result.isAlmostCorrect) {
            result.feedbackType = 'almostCorrect';
        }
        else if (result.containsText) {
            result.feedbackType = 'containsText';
        }
        else {
            result.feedbackType = 'incorrect';
        }
        await this.repository.save(result);
        return result;
    }
    async getStats() {
        const results = await this.repository.findAll();
        if (results.length === 0) {
            return {
                total: 0,
                correct: 0,
                almostCorrect: 0,
                containsText: 0,
                incorrect: 0,
                averageConfidence: 0,
                accuracy: 0,
                almostCorrectRate: 0,
                containsTextRate: 0,
            };
        }
        const correct = results.filter((r) => r.isCorrect).length;
        const almostCorrect = results.filter((r) => r.isAlmostCorrect && !r.isCorrect).length;
        const containsText = results.filter((r) => r.containsText && !r.isCorrect && !r.isAlmostCorrect).length;
        const incorrect = results.length - correct - almostCorrect - containsText;
        const averageConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
        const accuracy = (correct / results.length) * 100;
        const almostCorrectRate = (almostCorrect / results.length) * 100;
        const containsTextRate = (containsText / results.length) * 100;
        return {
            total: results.length,
            correct,
            almostCorrect,
            containsText,
            incorrect,
            averageConfidence: Math.round(averageConfidence * 100) / 100,
            accuracy: Math.round(accuracy * 100) / 100,
            almostCorrectRate: Math.round(almostCorrectRate * 100) / 100,
            containsTextRate: Math.round(containsTextRate * 100) / 100,
        };
    }
    async getStatsByExpectedText() {
        const results = await this.repository.findAll();
        const grouped = results.reduce((acc, result) => {
            const key = result.expectedText.trim().toLowerCase();
            if (!acc[key]) {
                acc[key] = {
                    expectedText: result.expectedText.trim(),
                    results: [],
                };
            }
            acc[key].results.push(result);
            return acc;
        }, {});
        return Object.values(grouped).map((group) => {
            const total = group.results.length;
            const correct = group.results.filter((r) => r.isCorrect).length;
            const almostCorrect = group.results.filter((r) => r.isAlmostCorrect && !r.isCorrect).length;
            const containsText = group.results.filter((r) => r.containsText && !r.isCorrect && !r.isAlmostCorrect).length;
            const incorrect = total - correct - almostCorrect - containsText;
            const accuracy = total > 0 ? (correct / total) * 100 : 0;
            const averageConfidence = group.results.reduce((sum, r) => sum + r.confidence, 0) / total;
            return {
                expectedText: group.expectedText,
                total,
                correct,
                almostCorrect,
                containsText,
                incorrect,
                accuracy: Math.round(accuracy * 100) / 100,
                averageConfidence: Math.round(averageConfidence * 100) / 100,
            };
        }).sort((a, b) => b.total - a.total);
    }
    async getIncorrectResults(limit = 10) {
        return this.repository.findIncorrect(limit);
    }
    async updateFeedback(id, feedback) {
        if (feedback.feedbackType) {
            feedback.isCorrect = feedback.feedbackType === 'correct';
            feedback.isAlmostCorrect = feedback.feedbackType === 'almostCorrect';
            feedback.containsText = feedback.feedbackType === 'containsText';
        }
        await this.repository.update(id, feedback);
    }
    async getAllResults() {
        return this.repository.findAll();
    }
};
exports.CalibrationService = CalibrationService;
exports.CalibrationService = CalibrationService = CalibrationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('IDataRepository')),
    __metadata("design:paramtypes", [Object])
], CalibrationService);
//# sourceMappingURL=calibration.service.js.map