"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CsvExportService = void 0;
const common_1 = require("@nestjs/common");
let CsvExportService = class CsvExportService {
    async export(data, options) {
        if (!Array.isArray(data)) {
            throw new Error('CSV export requires an array of data');
        }
        if (data.length === 0) {
            return {
                success: true,
                data: '',
                filename: options?.filename || `export-${Date.now()}.csv`,
                mimeType: 'text/csv',
                size: 0,
            };
        }
        const headers = [
            'ID',
            'Expected Text',
            'Extracted Text',
            'Confidence',
            'Is Correct',
            'Timestamp',
            'Corrections',
        ];
        const rows = data.map((item) => [
            item.id || '',
            this.escapeCsv(item.expectedText),
            this.escapeCsv(item.extractedText),
            item.confidence.toString(),
            item.isCorrect ? 'Yes' : 'No',
            item.timestamp.toISOString(),
            this.escapeCsv(item.corrections || ''),
        ]);
        const csv = [
            headers.join(','),
            ...rows.map((row) => row.join(',')),
        ].join('\n');
        const filename = options?.filename || `export-${Date.now()}.csv`;
        return {
            success: true,
            data: csv,
            filename,
            mimeType: 'text/csv',
            size: Buffer.byteLength(csv, 'utf8'),
        };
    }
    escapeCsv(value) {
        if (!value)
            return '';
        const escaped = value.replace(/"/g, '""');
        if (value.includes(',') || value.includes('\n') || value.includes('"')) {
            return `"${escaped}"`;
        }
        return escaped;
    }
};
exports.CsvExportService = CsvExportService;
exports.CsvExportService = CsvExportService = __decorate([
    (0, common_1.Injectable)()
], CsvExportService);
//# sourceMappingURL=csv-export.service.js.map