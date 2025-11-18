"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotFoundExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const path_1 = require("path");
const fs = require("fs");
let NotFoundExceptionFilter = class NotFoundExceptionFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        if (request.path.startsWith('/api')) {
            response.status(common_1.HttpStatus.NOT_FOUND).json({
                statusCode: common_1.HttpStatus.NOT_FOUND,
                message: exception.message || 'Not Found',
                error: 'Not Found',
            });
            return;
        }
        if (request.path.match(/\.[\w]+$/)) {
            response.status(common_1.HttpStatus.NOT_FOUND).json({
                statusCode: common_1.HttpStatus.NOT_FOUND,
                message: 'File not found',
                error: 'Not Found',
            });
            return;
        }
        const isProduction = process.env.NODE_ENV === 'production';
        if (isProduction) {
            const frontendPath = (0, path_1.join)(__dirname, '..', '..', '..', 'frontend', 'dist');
            const absoluteFrontendPath = (0, path_1.join)(process.cwd(), 'frontend', 'dist');
            let finalPath = null;
            if (fs.existsSync(frontendPath)) {
                finalPath = frontendPath;
            }
            else if (fs.existsSync(absoluteFrontendPath)) {
                finalPath = absoluteFrontendPath;
            }
            if (finalPath) {
                const indexPath = (0, path_1.join)(finalPath, 'index.html');
                console.log(`🌐 Exception Filter: Servindo index.html para: ${request.method} ${request.path}`);
                response.sendFile(indexPath, (err) => {
                    if (err) {
                        console.error('❌ Erro ao servir index.html no Exception Filter:', err);
                        response.status(common_1.HttpStatus.NOT_FOUND).json({
                            statusCode: common_1.HttpStatus.NOT_FOUND,
                            message: 'Not Found',
                            error: 'Not Found',
                        });
                    }
                });
                return;
            }
        }
        response.status(common_1.HttpStatus.NOT_FOUND).json({
            statusCode: common_1.HttpStatus.NOT_FOUND,
            message: exception.message || 'Not Found',
            error: 'Not Found',
        });
    }
};
exports.NotFoundExceptionFilter = NotFoundExceptionFilter;
exports.NotFoundExceptionFilter = NotFoundExceptionFilter = __decorate([
    (0, common_1.Catch)(common_1.NotFoundException)
], NotFoundExceptionFilter);
//# sourceMappingURL=http-exception.filter.js.map