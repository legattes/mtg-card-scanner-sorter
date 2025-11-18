# 📚 Documentação da API

A API do MTG Card Scanner Sorter está documentada usando Swagger/OpenAPI.

## 🌐 Acessando a Documentação

### Desenvolvimento
```
http://localhost:3000/docs
```

### Produção
```
http://localhost:3000/api/docs
```

## 📋 Endpoints Disponíveis

### Health Check
- **GET** `/api/health` - Verifica se a API está funcionando

### OCR
- **POST** `/ocr/process` - Processa imagem com OCR
  - Body: `{ image: string, expectedText?: string, saveForCalibration?: boolean }`
  - Retorna: `{ success: boolean, text: string, confidence: number, title?: string, calibrationId?: string }`

### Calibração

#### Estatísticas
- **GET** `/ocr/calibration/stats` - Estatísticas gerais de calibração
- **GET** `/ocr/calibration/stats/by-text` - Estatísticas agrupadas por texto esperado

#### Resultados
- **GET** `/ocr/calibration/results` - Todos os resultados de calibração
- **GET** `/ocr/calibration/incorrect` - Resultados incorretos para análise

#### Feedback
- **PATCH** `/ocr/calibration/:id/feedback` - Atualiza feedback de um resultado
  - Body: `{ feedbackType?: 'correct' | 'almostCorrect' | 'containsText' | 'incorrect', expectedText?: string, corrections?: string }`

#### Exportação
- **GET** `/ocr/calibration/export?format=json&filename=export` - Exporta dados de calibração
  - Query params:
    - `format`: `'json' | 'csv'` (padrão: `'json'`)
    - `filename`: Nome do arquivo (sem extensão)

## 🔧 Testando a API

### Usando Swagger UI

1. Acesse `http://localhost:3000/docs` (ou `/api/docs` em produção)
2. Expanda o endpoint desejado
3. Clique em "Try it out"
4. Preencha os parâmetros
5. Clique em "Execute"
6. Veja a resposta

### Exemplo: Processar Imagem

```bash
curl -X POST "http://localhost:3000/ocr/process" \
  -H "Content-Type: application/json" \
  -d '{
    "image": "data:image/png;base64,iVBORw0KGgo...",
    "expectedText": "Profundezas do Desejo",
    "saveForCalibration": true
  }'
```

### Exemplo: Obter Estatísticas

```bash
curl "http://localhost:3000/ocr/calibration/stats"
```

### Exemplo: Exportar Dados

```bash
curl "http://localhost:3000/ocr/calibration/export?format=json&filename=meu-export"
```

## 📊 Modelos de Dados

### OcrRequestDto
```typescript
{
  image: string;                    // Base64 image (obrigatório)
  expectedText?: string;            // Texto esperado para calibração
  saveForCalibration?: boolean;     // Salvar para calibração
}
```

### OcrResponseDto
```typescript
{
  success: boolean;                 // Sucesso do processamento
  text: string;                     // Texto extraído
  confidence: number;               // Confiança (0-100)
  title?: string;                   // Título extraído
  message?: string;                 // Mensagem de resposta
  calibrationId?: string;           // ID do resultado salvo
}
```

### CalibrationStatsDto
```typescript
{
  total: number;                   // Total de resultados
  correct: number;                 // Resultados corretos
  almostCorrect: number;           // Quase corretos (>90%)
  containsText: number;            // Contém texto
  incorrect: number;               // Incorretos
  averageConfidence: number;        // Confiança média
  accuracy: number;                 // Taxa de acurácia (%)
  almostCorrectRate: number;        // Taxa quase correto (%)
  containsTextRate: number;         // Taxa contém texto (%)
}
```

### OcrCalibrationResult
```typescript
{
  id?: string;                      // ID único
  expectedText: string;             // Texto esperado
  extractedText: string;            // Texto extraído
  confidence: number;               // Confiança (0-100)
  isCorrect: boolean;               // Está correto
  isAlmostCorrect?: boolean;        // Quase correto (>90%)
  containsText?: boolean;            // Contém texto
  feedbackType?: FeedbackType;      // Tipo de feedback
  corrections?: string;             // Correções
  timestamp: Date;                  // Data/hora
  parameters?: {                    // Parâmetros de processamento
    contrast?: number;
    brightness?: number;
    threshold?: number;
  };
}
```

## 🔐 Autenticação

Atualmente, a API não requer autenticação. Em produção, considere adicionar:

- API Keys
- JWT Tokens
- OAuth2

## 📝 Notas

- Imagens devem ser enviadas em formato Base64
- O limite de tamanho de imagem é 50MB
- Timeout de requisição é de 5 minutos
- Todos os endpoints retornam JSON

## 🐛 Códigos de Status HTTP

- `200` - Sucesso
- `400` - Requisição inválida
- `404` - Não encontrado
- `500` - Erro interno do servidor

## 📚 Recursos Adicionais

- [Swagger/OpenAPI Specification](https://swagger.io/specification/)
- [NestJS Swagger Documentation](https://docs.nestjs.com/openapi/introduction)

