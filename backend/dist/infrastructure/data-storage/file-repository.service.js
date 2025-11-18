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
var FileRepositoryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileRepositoryService = void 0;
const common_1 = require("@nestjs/common");
const ocr_calibration_result_entity_1 = require("../../domain/entities/ocr-calibration-result.entity");
const fs = require("fs");
const path = require("path");
let FileRepositoryService = FileRepositoryService_1 = class FileRepositoryService {
    constructor() {
        this.logger = new common_1.Logger(FileRepositoryService_1.name);
        this.dataDir = path.join(process.cwd(), 'data', 'calibration');
        this.dataFile = path.join(this.dataDir, 'ocr-calibration.json');
        this.logger.log(`Inicializando FileRepository - Diretório: ${this.dataDir}`);
        this.logger.log(`Arquivo de dados: ${this.dataFile}`);
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true });
            this.logger.log(`Diretório criado: ${this.dataDir}`);
        }
        else {
            this.logger.log(`Diretório já existe: ${this.dataDir}`);
        }
    }
    async save(result) {
        try {
            this.logger.log(`Tentando salvar resultado: ${JSON.stringify({
                expectedText: result.expectedText?.substring(0, 50),
                extractedText: result.extractedText?.substring(0, 50),
                confidence: result.confidence,
            })}`);
            const results = await this.findAll();
            this.logger.log(`Total de resultados existentes: ${results.length}`);
            if (!result.id) {
                result.id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            }
            result.timestamp = new Date();
            const resultToSave = {
                id: result.id,
                expectedText: result.expectedText || '',
                extractedText: result.extractedText || '',
                confidence: result.confidence || 0,
                imageHash: result.imageHash,
                isCorrect: result.isCorrect ?? false,
                corrections: result.corrections,
                timestamp: result.timestamp.toISOString(),
                parameters: result.parameters,
            };
            results.push(new ocr_calibration_result_entity_1.OcrCalibrationResult(resultToSave));
            const resultsToSave = results.map((r) => {
                const timestamp = r.timestamp instanceof Date
                    ? r.timestamp
                    : new Date(r.timestamp);
                return {
                    id: r.id,
                    expectedText: r.expectedText || '',
                    extractedText: r.extractedText || '',
                    confidence: r.confidence || 0,
                    imageHash: r.imageHash,
                    isCorrect: r.isCorrect ?? false,
                    corrections: r.corrections,
                    timestamp: timestamp.toISOString(),
                    parameters: r.parameters,
                };
            });
            const jsonData = JSON.stringify(resultsToSave, null, 2);
            this.logger.log(`Salvando ${resultsToSave.length} resultados no arquivo: ${this.dataFile}`);
            fs.writeFileSync(this.dataFile, jsonData, 'utf-8');
            if (fs.existsSync(this.dataFile)) {
                const stats = fs.statSync(this.dataFile);
                this.logger.log(`✅ Resultado salvo com sucesso! ID: ${result.id}, Tamanho do arquivo: ${stats.size} bytes`);
            }
            else {
                this.logger.error(`❌ Arquivo não foi criado: ${this.dataFile}`);
                throw new Error(`Falha ao criar arquivo: ${this.dataFile}`);
            }
        }
        catch (error) {
            this.logger.error('Erro ao salvar resultado:', error);
            this.logger.error(`Stack trace: ${error instanceof Error ? error.stack : 'N/A'}`);
            throw error;
        }
    }
    async findAll() {
        try {
            if (!fs.existsSync(this.dataFile)) {
                return [];
            }
            const data = fs.readFileSync(this.dataFile, 'utf-8');
            const results = JSON.parse(data);
            return results.map((r) => new ocr_calibration_result_entity_1.OcrCalibrationResult({
                ...r,
                timestamp: new Date(r.timestamp),
                isAlmostCorrect: r.isAlmostCorrect ?? false,
                containsText: r.containsText ?? false,
                feedbackType: r.feedbackType,
            }));
        }
        catch (error) {
            this.logger.error('Erro ao carregar resultados:', error);
            return [];
        }
    }
    async findById(id) {
        const results = await this.findAll();
        return results.find((r) => r.id === id) || null;
    }
    async update(id, updates) {
        const results = await this.findAll();
        const index = results.findIndex((r) => r.id === id);
        if (index === -1) {
            throw new Error(`Resultado não encontrado: ${id}`);
        }
        results[index] = new ocr_calibration_result_entity_1.OcrCalibrationResult({ ...results[index], ...updates });
        const resultsToSave = results.map((r) => {
            const timestamp = r.timestamp instanceof Date
                ? r.timestamp
                : new Date(r.timestamp);
            return {
                id: r.id,
                expectedText: r.expectedText || '',
                extractedText: r.extractedText || '',
                confidence: r.confidence || 0,
                imageHash: r.imageHash,
                isCorrect: r.isCorrect ?? false,
                isAlmostCorrect: r.isAlmostCorrect ?? false,
                containsText: r.containsText ?? false,
                feedbackType: r.feedbackType,
                corrections: r.corrections,
                timestamp: timestamp.toISOString(),
                parameters: r.parameters,
            };
        });
        fs.writeFileSync(this.dataFile, JSON.stringify(resultsToSave, null, 2), 'utf-8');
        this.logger.log(`Resultado atualizado: ${id}`);
    }
    async cleanOld(daysOld) {
        const results = await this.findAll();
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);
        const filtered = results.filter((r) => r.timestamp.getTime() > cutoffDate.getTime());
        const removed = results.length - filtered.length;
        if (removed > 0) {
            const resultsToSave = filtered.map((r) => {
                const timestamp = r.timestamp instanceof Date
                    ? r.timestamp
                    : new Date(r.timestamp);
                return {
                    id: r.id,
                    expectedText: r.expectedText || '',
                    extractedText: r.extractedText || '',
                    confidence: r.confidence || 0,
                    imageHash: r.imageHash,
                    isCorrect: r.isCorrect ?? false,
                    corrections: r.corrections,
                    timestamp: timestamp.toISOString(),
                    parameters: r.parameters,
                };
            });
            fs.writeFileSync(this.dataFile, JSON.stringify(resultsToSave, null, 2), 'utf-8');
            this.logger.log(`Removidos ${removed} resultados antigos`);
        }
        return removed;
    }
    async findIncorrect(limit = 10) {
        const results = await this.findAll();
        return results
            .filter((r) => !r.isCorrect)
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, limit);
    }
};
exports.FileRepositoryService = FileRepositoryService;
exports.FileRepositoryService = FileRepositoryService = FileRepositoryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], FileRepositoryService);
//# sourceMappingURL=file-repository.service.js.map