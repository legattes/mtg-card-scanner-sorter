import { ApiPropertyOptional } from '@nestjs/swagger';

export class CalibrationFeedbackDto {
  @ApiPropertyOptional({
    description: 'Indica se o resultado está correto',
    example: true,
  })
  isCorrect?: boolean;

  @ApiPropertyOptional({
    description: 'Indica se o resultado está quase correto (>90% similaridade)',
    example: false,
  })
  isAlmostCorrect?: boolean;

  @ApiPropertyOptional({
    description: 'Indica se o texto extraído contém o texto esperado',
    example: false,
  })
  containsText?: boolean;

  @ApiPropertyOptional({
    description: 'Tipo de feedback',
    enum: ['correct', 'almostCorrect', 'containsText', 'incorrect'],
    example: 'correct',
  })
  feedbackType?: 'correct' | 'almostCorrect' | 'containsText' | 'incorrect';

  @ApiPropertyOptional({
    description: 'Texto esperado corrigido',
    example: 'Profundezas do Desejo',
  })
  expectedText?: string;

  @ApiPropertyOptional({
    description: 'Correções ou observações sobre o resultado',
    example: 'Texto estava quase correto, apenas um caractere diferente',
  })
  corrections?: string;
}

