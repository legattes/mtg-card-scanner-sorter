# MTG Card Scanner Sorter

Projeto para escanear e organizar cartas de Magic: The Gathering usando React (frontend) e NestJS (backend).

## 🚀 Início Rápido

### ⚠️ IMPORTANTE: Modo Desenvolvimento vs Produção

**Em Desenvolvimento:**
- Backend: `http://localhost:3000`
- Frontend: `http://localhost:5173` (Vite dev server)
- Use quando estiver desenvolvendo/codificando

**Em Produção:**
- **TUDO roda na porta 3000** (backend serve o frontend)
- Use quando quiser testar como PWA ou usar no smartphone

### Desenvolvimento
```bash
npm run dev
```
Inicia backend (porta 3000) e frontend (porta 5173) simultaneamente.
**Acesse:** `http://localhost:5173` (frontend) que se conecta ao backend na porta 3000.

### Produção (Servidor Único)
```bash
# 1. Buildar tudo
npm run build

# 2. Iniciar servidor único
npm start
# ou
npm run start:prod
```
**Acesse:** `http://localhost:3000` - **TUDO em um único servidor!**
- Frontend: `http://localhost:3000`
- API: `http://localhost:3000/api`

## 📱 PWA (Progressive Web App)

Este projeto é uma PWA e pode ser instalado no seu smartphone!

Veja o guia completo em: [PWA_SETUP.md](./PWA_SETUP.md)

### ⚠️ IMPORTANTE para iOS (iPhone/iPad):

**iOS requer HTTPS para:**
- ✅ Acesso à câmera
- ✅ Instalação de PWA
- ✅ Service Worker

**Soluções:**
1. **ngrok** (recomendado para testes): Veja [HTTPS_SETUP.md](./HTTPS_SETUP.md)
2. **HTTPS local**: Configure certificados SSL (veja [HTTPS_SETUP.md](./HTTPS_SETUP.md))
3. **localhost**: Funciona apenas no mesmo dispositivo

### Resumo Rápido:
1. Build e start do servidor
2. Configure HTTPS (veja [HTTPS_SETUP.md](./HTTPS_SETUP.md))
3. Acesse do smartphone via HTTPS
4. Instale como app nativo (iOS: Compartilhar → Adicionar à Tela de Início)

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn

## 🔧 Instalação

```bash
npm run install:all
```

## 📚 Documentação

- [INSTALL.md](./INSTALL.md) - Instruções detalhadas de instalação
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitetura do projeto
- [PWA_SETUP.md](./PWA_SETUP.md) - Guia de configuração PWA
- [HTTPS_SETUP.md](./HTTPS_SETUP.md) - **Configuração HTTPS para iOS** ⚠️
- [DATA_LOCATION.md](./DATA_LOCATION.md) - Localização dos dados

## Estrutura do Projeto

```
mtg-card-scanner-sorter/
├── backend/          # API NestJS
├── frontend/         # Aplicação React
└── README.md
```

## Tecnologias

- **Backend**: NestJS, TypeScript
- **Frontend**: React, TypeScript, Vite

## Instalação

### Backend
```bash
cd backend
npm install
npm run start:dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Desenvolvimento

O backend roda na porta 3000 por padrão.
O frontend roda na porta 5173 por padrão (Vite).

