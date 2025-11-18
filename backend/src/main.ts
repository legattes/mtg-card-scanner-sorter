import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilitar CORS para comunicação com o frontend
  app.enableCors({
    origin: 'http://localhost:5173', // Porta padrão do Vite
    credentials: true,
  });
  
  await app.listen(3000);
  console.log('🚀 Backend rodando em http://localhost:3000');
}
bootstrap();
