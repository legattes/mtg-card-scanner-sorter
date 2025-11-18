"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const express_1 = require("express");
const express = require("express");
const path_1 = require("path");
const fs = require("fs");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use((0, express_1.json)({ limit: '50mb' }));
    app.use((req, res, next) => {
        req.setTimeout(300000);
        res.setTimeout(300000);
        next();
    });
    const isProduction = process.env.NODE_ENV === 'production';
    const corsOrigin = process.env.CORS_ORIGIN || (isProduction ? '*' : 'http://localhost:5173');
    app.enableCors({
        origin: corsOrigin,
        credentials: true,
    });
    if (isProduction) {
        app.useGlobalFilters(new http_exception_filter_1.NotFoundExceptionFilter());
    }
    if (isProduction) {
        app.setGlobalPrefix('api');
    }
    if (isProduction) {
        const frontendPath = (0, path_1.join)(__dirname, '..', '..', 'frontend', 'dist');
        const absoluteFrontendPath = (0, path_1.join)(process.cwd(), 'frontend', 'dist');
        console.log(`🔍 __dirname: ${__dirname}`);
        console.log(`🔍 process.cwd(): ${process.cwd()}`);
        console.log(`🔍 Tentando caminho relativo: ${frontendPath}`);
        console.log(`🔍 Tentando caminho absoluto: ${absoluteFrontendPath}`);
        let finalPath = null;
        if (fs.existsSync(frontendPath)) {
            finalPath = frontendPath;
            console.log(`✅ Usando caminho relativo: ${finalPath}`);
        }
        else if (fs.existsSync(absoluteFrontendPath)) {
            finalPath = absoluteFrontendPath;
            console.log(`✅ Usando caminho absoluto: ${finalPath}`);
        }
        else {
            console.error(`❌ Diretório frontend/dist não encontrado!`);
            console.error(`   Tentado: ${frontendPath}`);
            console.error(`   Tentado: ${absoluteFrontendPath}`);
            console.error('   Execute "npm run build:frontend" antes de iniciar em produção');
        }
        if (finalPath) {
            const indexPath = (0, path_1.join)(finalPath, 'index.html');
            console.log(`📄 Index.html em: ${indexPath}`);
            const expressApp = app.getHttpAdapter().getInstance();
            expressApp.use(express.static(finalPath, {
                index: false,
                setHeaders: (res, path) => {
                    if (path.endsWith('.html') || path.endsWith('.js') || path.endsWith('.css')) {
                        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
                        res.setHeader('Pragma', 'no-cache');
                        res.setHeader('Expires', '0');
                    }
                },
            }));
            console.log(`📁 Arquivos estáticos configurados`);
            app.use((req, res, next) => {
                if (req.path.startsWith('/api')) {
                    console.log(`  → Rota API: ${req.method} ${req.path}, passando para NestJS`);
                    return next();
                }
                if (req.path.match(/\.[\w]+$/)) {
                    console.log(`  → Arquivo estático: ${req.path}, já servido`);
                    return next();
                }
                console.log(`🌐 Servindo index.html para: ${req.method} ${req.path}`);
                res.sendFile(indexPath, (err) => {
                    if (err) {
                        console.error('❌ Erro ao servir index.html:', err);
                        next(err);
                    }
                    else {
                        console.log(`✅ index.html servido com sucesso para: ${req.path}`);
                    }
                });
            });
        }
    }
    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`🚀 Servidor rodando em http://localhost:${port}`);
    if (isProduction) {
        console.log(`📱 PWA disponível para instalação`);
        console.log(`🌐 Frontend disponível em: http://localhost:${port}`);
        console.log(`🔌 API disponível em: http://localhost:${port}/api`);
    }
}
bootstrap();
//# sourceMappingURL=main.js.map