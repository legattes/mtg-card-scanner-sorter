# 🧪 Guia de Testes

Este documento descreve como executar e escrever testes para o projeto MTG Card Scanner Sorter.

## 📋 Estrutura de Testes

### Backend (NestJS + Jest)

Os testes do backend estão localizados junto com os arquivos de código fonte, seguindo o padrão `*.spec.ts`:

```
backend/src/
├── application/
│   └── services/
│       ├── calibration.service.ts
│       └── calibration.service.spec.ts  ✅
├── domain/
│   └── entities/
│       ├── ocr-calibration-result.entity.ts
│       └── ocr-calibration-result.entity.spec.ts  ✅
└── infrastructure/
    └── data-storage/
        ├── file-repository.service.ts
        └── file-repository.service.spec.ts  ✅
```

### Frontend (React + Vitest)

Os testes do frontend estão localizados junto com os arquivos de código fonte:

```
frontend/src/
├── utils/
│   ├── imageProcessing.ts
│   └── imageProcessing.spec.ts  ✅
└── test/
    └── setup.ts  ✅ (Configuração global)
```

## 🚀 Executando Testes

### Backend

```bash
# Executar todos os testes
cd backend
npm test

# Executar em modo watch (re-executa quando arquivos mudam)
npm run test:watch

# Executar com cobertura de código
npm run test:cov

# Executar testes E2E
npm run test:e2e
```

### Frontend

```bash
# Executar todos os testes
cd frontend
npm test

# Executar em modo watch
npm test -- --watch

# Executar com interface gráfica
npm run test:ui

# Executar com cobertura de código
npm run test:coverage
```

## 📝 Testes Disponíveis

### Backend

#### ✅ CalibrationService (`calibration.service.spec.ts`)
- Testa salvamento de resultados com diferentes tipos de feedback
- Testa cálculo de estatísticas
- Testa agrupamento por texto esperado
- Testa atualização de feedback

#### ✅ OcrCalibrationResult (`ocr-calibration-result.entity.spec.ts`)
- Testa validação de textos (correto/incorreto)
- Testa cálculo de similaridade
- Testa verificação de "quase correto" (>90%)
- Testa verificação de "contém texto"
- Testa cálculo de diferença (Levenshtein)

#### ✅ FileRepositoryService (`file-repository.service.spec.ts`)
- Testa salvamento de resultados
- Testa busca de resultados
- Testa atualização de resultados
- Testa limpeza de resultados antigos
- Testa busca de resultados incorretos

### Frontend

#### ✅ imageProcessing (`imageProcessing.spec.ts`)
- Testa processamento de imagem para OCR
- Testa aplicação de filtros (brilho, contraste, escala de cinza)
- Testa aplicação de threshold (binarização)
- Testa correção de gamma
- Testa upscale de imagens

## ✍️ Escrevendo Novos Testes

### Backend (Jest)

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { SeuService } from './seu-service';

describe('SeuService', () => {
  let service: SeuService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SeuService],
    }).compile();

    service = module.get<SeuService>(SeuService);
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
  });

  it('deve fazer algo específico', () => {
    // Arrange
    const input = 'dados de teste';
    
    // Act
    const result = service.fazerAlgo(input);
    
    // Assert
    expect(result).toBe('resultado esperado');
  });
});
```

### Frontend (Vitest)

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { suaFuncao } from './seu-arquivo';

describe('suaFuncao', () => {
  beforeEach(() => {
    // Setup antes de cada teste
  });

  it('deve fazer algo específico', () => {
    // Arrange
    const input = 'dados de teste';
    
    // Act
    const result = suaFuncao(input);
    
    // Assert
    expect(result).toBe('resultado esperado');
  });
});
```

## 🎯 Boas Práticas

1. **Nomes Descritivos**: Use nomes claros que descrevem o que está sendo testado
2. **AAA Pattern**: Organize testes em Arrange (preparar), Act (executar), Assert (verificar)
3. **Isolamento**: Cada teste deve ser independente e não depender de outros
4. **Mocks**: Use mocks para dependências externas (arquivos, APIs, etc.)
5. **Cobertura**: Procure manter alta cobertura de código, especialmente em lógica crítica

## 📊 Cobertura de Código

Execute com cobertura para ver quais partes do código estão sendo testadas:

```bash
# Backend
cd backend && npm run test:cov

# Frontend
cd frontend && npm run test:coverage
```

## 🔧 Configuração

### Jest (Backend)
Configurado em `backend/package.json`:
- `testRegex`: `.*\\.spec\\.ts$`
- `rootDir`: `src`
- `coverageDirectory`: `../coverage`

### Vitest (Frontend)
Configurado em `frontend/vite.config.ts`:
- `globals`: `true`
- `environment`: `jsdom`
- `setupFiles`: `./src/test/setup.ts`

## 🐛 Troubleshooting

### Erros Comuns

1. **"Cannot find module"**: Verifique os caminhos de importação
2. **"Mock não funciona"**: Certifique-se de que os mocks estão configurados antes de usar
3. **"Timeout"**: Aumente o timeout para testes assíncronos: `it('teste', async () => {...}, 10000)`

## 📚 Recursos

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Vitest Documentation](https://vitest.dev/guide/)
- [Testing Library](https://testing-library.com/)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)

