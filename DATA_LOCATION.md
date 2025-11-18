# Localização dos Dados

## Dados de Calibração

Os dados de calibração são armazenados em:

**Localização:** `backend/data/calibration/ocr-calibration.json`

### Estrutura dos Dados

Cada entrada contém:
- `id`: Identificador único
- `expectedText`: Texto esperado/correto
- `extractedText`: Texto extraído pelo OCR
- `confidence`: Confiança do OCR (0-100)
- `imageHash`: Hash da imagem (para evitar duplicatas)
- `isCorrect`: Se o resultado está correto
- `corrections`: Correções manuais aplicadas (opcional)
- `timestamp`: Data e hora da captura
- `parameters`: Parâmetros de processamento usados (opcional)

### Acessar os Dados

#### Via API:

1. **Obter todos os resultados:**
   ```
   GET /api/ocr/calibration/results
   ```

2. **Obter estatísticas:**
   ```
   GET /api/ocr/calibration/stats
   ```

3. **Exportar dados:**
   ```
   GET /api/ocr/calibration/export?format=json
   GET /api/ocr/calibration/export?format=csv
   ```

4. **Obter resultados incorretos:**
   ```
   GET /api/ocr/calibration/incorrect
   ```

#### Via Arquivo:

O arquivo JSON pode ser acessado diretamente em:
```
backend/data/calibration/ocr-calibration.json
```

**Nota:** Este arquivo está no `.gitignore` e não será commitado no repositório.

