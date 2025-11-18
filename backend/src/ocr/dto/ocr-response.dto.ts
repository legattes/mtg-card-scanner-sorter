import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OcrResponseDto {
  @ApiProperty({
    description: 'Indica se o processamento foi bem-sucedido',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Texto extraído da imagem',
    example: 'Profundezas do Desejo',
  })
  text: string;

  @ApiProperty({
    description: 'Nível de confiança do OCR (0-100)',
    example: 95.5,
    minimum: 0,
    maximum: 100,
  })
  confidence: number;

  @ApiPropertyOptional({
    description: 'Título extraído (primeiras 3 linhas)',
    example: 'Profundezas do Desejo',
  })
  title?: string;

  @ApiPropertyOptional({
    description: 'Mensagem de resposta',
    example: 'OCR processado com sucesso',
  })
  message?: string;

  @ApiPropertyOptional({
    description: 'ID do resultado salvo para calibração',
    example: '1234567890-abc123',
  })
  calibrationId?: string;
}

