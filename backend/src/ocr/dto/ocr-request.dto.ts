import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OcrRequestDto {
  @ApiProperty({
    description: 'Imagem em formato Base64',
    example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  })
  image: string;

  @ApiPropertyOptional({
    description: 'Texto esperado para calibração do OCR',
    example: 'Profundezas do Desejo',
  })
  expectedText?: string;

  @ApiPropertyOptional({
    description: 'Se deve salvar o resultado para calibração',
    default: false,
  })
  saveForCalibration?: boolean;
}

