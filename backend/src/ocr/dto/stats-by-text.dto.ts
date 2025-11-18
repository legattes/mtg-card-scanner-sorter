import { ApiProperty } from '@nestjs/swagger';

export class StatsByTextDto {
  @ApiProperty({
    description: 'Texto esperado',
    example: 'Profundezas do Desejo',
  })
  expectedText: string;

  @ApiProperty({
    description: 'Total de resultados para este texto',
    example: 25,
  })
  total: number;

  @ApiProperty({
    description: 'Número de resultados corretos',
    example: 20,
  })
  correct: number;

  @ApiProperty({
    description: 'Número de resultados quase corretos',
    example: 3,
  })
  almostCorrect: number;

  @ApiProperty({
    description: 'Número de resultados que contêm o texto',
    example: 1,
  })
  containsText: number;

  @ApiProperty({
    description: 'Número de resultados incorretos',
    example: 1,
  })
  incorrect: number;

  @ApiProperty({
    description: 'Taxa de acurácia (porcentagem)',
    example: 80.0,
  })
  accuracy: number;

  @ApiProperty({
    description: 'Confiança média do OCR',
    example: 90.5,
  })
  averageConfidence: number;
}

