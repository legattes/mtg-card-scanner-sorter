import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { json } from 'express';
import * as express from 'express';
import { join } from 'path';
import * as fs from 'fs';
import { NotFoundExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Aumentar limite do body para imagens grandes (50MB)
  app.use(json({ limit: '50mb' }));

  // Aumentar timeout para processamento de OCR
  app.use((req, res, next) => {
    req.setTimeout(300000); // 5 minutos timeout
    res.setTimeout(300000);
    next();
  });

  // Habilitar CORS primeiro
  const isProduction = process.env.NODE_ENV === 'production';
  const corsOrigin = process.env.CORS_ORIGIN || (isProduction ? '*' : 'http://localhost:5173');
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  // Configurar Exception Filter para capturar 404 e servir index.html
  if (isProduction) {
    app.useGlobalFilters(new NotFoundExceptionFilter());
  }

  // Configurar prefixo global para API (apenas em produção)
  // Isso faz com que todas as rotas tenham /api como prefixo
  if (isProduction) {
    app.setGlobalPrefix('api');
  }

  // Servir arquivos estáticos do frontend (apenas em produção)
  // IMPORTANTE: Usar app.use() do NestJS que é executado ANTES das rotas serem processadas
  if (isProduction) {
    const frontendPath = join(__dirname, '..', '..', 'frontend', 'dist');
    const absoluteFrontendPath = join(process.cwd(), 'frontend', 'dist');
    
    console.log(`🔍 __dirname: ${__dirname}`);
    console.log(`🔍 process.cwd(): ${process.cwd()}`);
    console.log(`🔍 Tentando caminho relativo: ${frontendPath}`);
    console.log(`🔍 Tentando caminho absoluto: ${absoluteFrontendPath}`);
    
    let finalPath = null;
    if (fs.existsSync(frontendPath)) {
      finalPath = frontendPath;
      console.log(`✅ Usando caminho relativo: ${finalPath}`);
    } else if (fs.existsSync(absoluteFrontendPath)) {
      finalPath = absoluteFrontendPath;
      console.log(`✅ Usando caminho absoluto: ${finalPath}`);
    } else {
      console.error(`❌ Diretório frontend/dist não encontrado!`);
      console.error(`   Tentado: ${frontendPath}`);
      console.error(`   Tentado: ${absoluteFrontendPath}`);
      console.error('   Execute "npm run build:frontend" antes de iniciar em produção');
    }
    
    if (finalPath) {
      const indexPath = join(finalPath, 'index.html');
      console.log(`📄 Index.html em: ${indexPath}`);
      
      // Servir arquivos estáticos usando Express diretamente com headers de no-cache
      const expressApp = app.getHttpAdapter().getInstance();
      expressApp.use(express.static(finalPath, {
        index: false,
        setHeaders: (res, path) => {
          // Para arquivos HTML, JS e CSS, adicionar headers de no-cache
          if (path.endsWith('.html') || path.endsWith('.js') || path.endsWith('.css')) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
          }
        },
      }));
      console.log(`📁 Arquivos estáticos configurados`);
      
      // Middleware usando app.use() do NestJS - executado ANTES das rotas
      app.use((req, res, next) => {
        // Se é uma rota de API, passar adiante para o NestJS processar
        if (req.path.startsWith('/api')) {
          console.log(`  → Rota API: ${req.method} ${req.path}, passando para NestJS`);
          return next();
        }
        
        // Se é um arquivo estático (tem extensão), já foi servido pelo useStaticAssets
        if (req.path.match(/\.[\w]+$/)) {
          console.log(`  → Arquivo estático: ${req.path}, já servido`);
          return next();
        }
        
        // Para todas as outras rotas, servir index.html (SPA routing)
        console.log(`🌐 Servindo index.html para: ${req.method} ${req.path}`);
        res.sendFile(indexPath, (err) => {
          if (err) {
            console.error('❌ Erro ao servir index.html:', err);
            next(err);
          } else {
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