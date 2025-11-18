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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportService = void 0;
const common_1 = require("@nestjs/common");
const json_export_service_1 = require("../../infrastructure/export/json-export.service");
const csv_export_service_1 = require("../../infrastructure/export/csv-export.service");
let ExportService = class ExportService {
    constructor(jsonExporter, csvExporter) {
        this.jsonExporter = jsonExporter;
        this.csvExporter = csvExporter;
    }
    async exportData(data, options) {
        switch (options.format) {
            case 'json':
                return this.jsonExporter.export(data, options);
            case 'csv':
                return this.csvExporter.export(data, options);
            default:
                throw new Error(`Formato de exportação não suportado: ${options.format}`);
        }
    }
};
exports.ExportService = ExportService;
exports.ExportService = ExportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [json_export_service_1.JsonExportService,
        csv_export_service_1.CsvExportService])
], ExportService);
//# sourceMappingURL=export.service.js.map