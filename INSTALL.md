# Instalação e Configuração

## Backend - Instalação de Dependências

Para o OCR funcionar, você precisa instalar o Tesseract.js no backend:

```bash
cd backend
npm install tesseract.js
```

## Primeira Execução

Na primeira vez que o OCR for executado, o Tesseract.js irá baixar automaticamente os arquivos de idioma necessários (português e inglês). Isso pode levar alguns minutos.

## Executando o Projeto

### Backend
```bash
cd backend
npm install
npm run start:dev
```

O backend estará rodando em `http://localhost:3000`

### Frontend
```bash
cd frontend
npm install
npm run dev
```

O frontend estará rodando em `http://localhost:5173`

## Testando o OCR

1. Acesse `http://localhost:5173`
2. Clique em "Iniciar Webcam"
3. Posicione uma nota médica na frente da câmera
4. Clique em "Capturar Imagem"
5. Aguarde o processamento do OCR
6. O título identificado aparecerá no resultado

## Notas

- O OCR está configurado para português e inglês (`por+eng`)
- O título é extraído das primeiras 3 linhas do texto identificado
- A confiança do OCR é exibida junto com os resultados

