"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const express_1 = require("express");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use((0, express_1.json)({ limit: '50mb' }));
    app.use((req, res, next) => {
        req.setTimeout(300000);
        res.setTimeout(300000);
        next();
    });
    app.enableCors({
        origin: 'http://localhost:5173',
        credentials: true,
    });
    await app.listen(3000);
    console.log('🚀 Backend rodando em http://localhost:3000');
}
bootstrap();
//# sourceMappingURL=main.js.map