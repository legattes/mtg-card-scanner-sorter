import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';
import * as fs from 'fs';

@Catch(NotFoundException)
export class NotFoundExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    // Se é uma rota de API, retornar 404 normalmente
    if (request.path.startsWith('/api')) {
      response.status(HttpStatus.NOT_FOUND).json({
        statusCode: HttpStatus.NOT_FOUND,
        message: exception.message || 'Not Found',
        error: 'Not Found',
      });
      return;
    }

    // Se é um arquivo estático, retornar 404 normalmente
    if (request.path.match(/\.[\w]+$/)) {
      response.status(HttpStatus.NOT_FOUND).json({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'File not found',
        error: 'Not Found',
      });
      return;
    }

    // Para todas as outras rotas, servir index.html (SPA routing)
    const isProduction = process.env.NODE_ENV === 'production';
    if (isProduction) {
      const frontendPath = join(__dirname, '..', '..', '..', 'frontend', 'dist');
      const absoluteFrontendPath = join(process.cwd(), 'frontend', 'dist');
      
      let finalPath = null;
      if (fs.existsSync(frontendPath)) {
        finalPath = frontendPath;
      } else if (fs.existsSync(absoluteFrontendPath)) {
        finalPath = absoluteFrontendPath;
      }
      
      if (finalPath) {
        const indexPath = join(finalPath, 'index.html');
        console.log(`🌐 Exception Filter: Servindo index.html para: ${request.method} ${request.path}`);
        response.sendFile(indexPath, (err) => {
          if (err) {
            console.error('❌ Erro ao servir index.html no Exception Filter:', err);
            response.status(HttpStatus.NOT_FOUND).json({
              statusCode: HttpStatus.NOT_FOUND,
              message: 'Not Found',
              error: 'Not Found',
            });
          }
        });
        return;
      }
    }

    // Fallback: retornar 404 normal
    response.status(HttpStatus.NOT_FOUND).json({
      statusCode: HttpStatus.NOT_FOUND,
      message: exception.message || 'Not Found',
      error: 'Not Found',
    });
  }
}

