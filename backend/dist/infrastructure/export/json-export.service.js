"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonExportService = void 0;
const common_1 = require("@nestjs/common");
let JsonExportService = class JsonExportService {
    async export(data, options) {
        const json = JSON.stringify(data, null, 2);
        const filename = options?.filename || `export-${Date.now()}.json`;
        return {
            success: true,
            data: json,
            filename,
            mimeType: 'application/json',
            size: Buffer.byteLength(json, 'utf8'),
        };
    }
};
exports.JsonExportService = JsonExportService;
exports.JsonExportService = JsonExportService = __decorate([
    (0, common_1.Injectable)()
], JsonExportService);
//# sourceMappingURL=json-export.service.js.map