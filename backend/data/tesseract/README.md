# Arquivos de Treinamento Tesseract

Esta pasta contém os arquivos de treinamento do Tesseract OCR (`.traineddata`).

## Arquivos Disponíveis

- `eng.traineddata` - Modelo de treinamento para inglês
- `por.traineddata` - Modelo de treinamento para português

## Nota

O Tesseract.js normalmente baixa esses arquivos automaticamente quando necessário. Estes arquivos estão aqui caso você queira usar versões específicas ou personalizadas.

## Tamanho dos Arquivos

⚠️ **Atenção**: Arquivos `.traineddata` são grandes (geralmente 10-50MB cada). Se você não precisa versioná-los, adicione esta pasta ao `.gitignore`:

```
backend/data/tesseract/*.traineddata
```

