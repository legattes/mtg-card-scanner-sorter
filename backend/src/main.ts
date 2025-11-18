import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Aumentar limite do body para imagens grandes (50MB)
  app.use(json({ limit: '50mb' }));

  // Aumentar timeout para processamento de OCR
  app.use((req, res, next) => {
    req.setTimeout(300000); // 5 minutos timeout
    res.setTimeout(300000);
    next();
  });

  // Habilitar CORS para comunicação com o frontend
  app.enableCors({
    origin: 'http://localhost:5173', // Porta padrão do Vite
    credentials: true,
  });

  await app.listen(3000);
  console.log('🚀 Backend rodando em http://localhost:3000');
}
bootstrap();
