"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OcrCalibrationResult = void 0;
class OcrCalibrationResult {
    constructor(data = {}) {
        this.id = data.id;
        this.expectedText = data.expectedText || '';
        this.extractedText = data.extractedText || '';
        this.confidence = data.confidence || 0;
        this.imageBase64 = data.imageBase64;
        this.imageHash = data.imageHash;
        this.isCorrect = data.isCorrect ?? false;
        this.isAlmostCorrect = data.isAlmostCorrect ?? false;
        this.containsText = data.containsText ?? false;
        this.feedbackType = data.feedbackType;
        this.corrections = data.corrections;
        this.timestamp = data.timestamp || new Date();
        this.parameters = data.parameters;
    }
    calculateDifference() {
        const expected = this.expectedText.toLowerCase().trim();
        const extracted = this.extractedText.toLowerCase().trim();
        if (expected === extracted)
            return 0;
        return this.levenshteinDistance(expected, extracted);
    }
    validate() {
        const expected = this.expectedText.toLowerCase().trim();
        const extracted = this.extractedText.toLowerCase().trim();
        return expected === extracted;
    }
    calculateSimilarity() {
        const expected = this.expectedText.toLowerCase().trim();
        const extracted = this.extractedText.toLowerCase().trim();
        if (expected === extracted)
            return 100;
        if (expected.length === 0 || extracted.length === 0)
            return 0;
        const distance = this.levenshteinDistance(expected, extracted);
        const maxLength = Math.max(expected.length, extracted.length);
        const similarity = ((maxLength - distance) / maxLength) * 100;
        return Math.round(similarity * 100) / 100;
    }
    isAlmostCorrectCheck() {
        return this.calculateSimilarity() >= 90;
    }
    containsTextCheck() {
        const expected = this.expectedText.toLowerCase().trim();
        const extracted = this.extractedText.toLowerCase().trim();
        if (expected.length === 0)
            return false;
        return extracted.includes(expected);
    }
    levenshteinDistance(str1, str2) {
        const matrix = [];
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                }
                else {
                    matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
                }
            }
        }
        return matrix[str2.length][str1.length];
    }
}
exports.OcrCalibrationResult = OcrCalibrationResult;
//# sourceMappingURL=ocr-calibration-result.entity.js.map