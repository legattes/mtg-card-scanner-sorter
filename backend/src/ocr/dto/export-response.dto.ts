import { ApiProperty } from '@nestjs/swagger';

export class ExportResponseDto {
  @ApiProperty({
    description: 'Indica se a exportação foi bem-sucedida',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Dados exportados (Base64 para JSON/CSV)',
    example: 'W3siaWQiOiIxMjM0NTY3ODkwLWFiYzEyMyIsImV4cGVjdGVkVGV4dCI6IlByb2Z1bmRlemFzIGRvIERlc2VqbyIsImV4dHJhY3RlZFRleHQiOiJQcm9mdW5kZXphcyBkbyBEZXNlam8iLCJjb25maWRlbmNlIjo5NS41fV0=',
  })
  data: string;

  @ApiProperty({
    description: 'Nome do arquivo gerado',
    example: 'calibration-export-1234567890.json',
  })
  filename: string;

  @ApiProperty({
    description: 'Tipo MIME do arquivo',
    example: 'application/json',
    enum: ['application/json', 'text/csv'],
  })
  mimeType: string;

  @ApiProperty({
    description: 'Tamanho do arquivo em bytes',
    example: 1024,
  })
  size: number;
}

