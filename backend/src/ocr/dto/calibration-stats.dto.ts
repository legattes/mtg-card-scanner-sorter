import { ApiProperty } from '@nestjs/swagger';

export class CalibrationStatsDto {
  @ApiProperty({
    description: 'Total de resultados de calibração',
    example: 100,
  })
  total: number;

  @ApiProperty({
    description: 'Número de resultados corretos',
    example: 75,
  })
  correct: number;

  @ApiProperty({
    description: 'Número de resultados quase corretos (>90% similaridade)',
    example: 15,
  })
  almostCorrect: number;

  @ApiProperty({
    description: 'Número de resultados que contêm o texto esperado',
    example: 5,
  })
  containsText: number;

  @ApiProperty({
    description: 'Número de resultados incorretos',
    example: 5,
  })
  incorrect: number;

  @ApiProperty({
    description: 'Confiança média do OCR',
    example: 87.5,
  })
  averageConfidence: number;

  @ApiProperty({
    description: 'Taxa de acurácia (porcentagem)',
    example: 75.0,
  })
  accuracy: number;

  @ApiProperty({
    description: 'Taxa de quase correto (porcentagem)',
    example: 15.0,
  })
  almostCorrectRate: number;

  @ApiProperty({
    description: 'Taxa de contém texto (porcentagem)',
    example: 5.0,
  })
  containsTextRate: number;
}

