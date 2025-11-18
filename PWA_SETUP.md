# Guia de Configuração PWA

## Ícones Necessários

Para completar a configuração PWA, você precisa criar dois ícones:

1. **icon-192.png** - 192x192 pixels
2. **icon-512.png** - 512x512 pixels

Coloque-os em: `frontend/public/`

### Gerar Ícones

Você pode usar ferramentas online para gerar os ícones:
- https://www.pwabuilder.com/imageGenerator
- https://realfavicongenerator.net/
- https://favicon.io/

Ou criar manualmente usando qualquer editor de imagens.

## Como Usar

### Desenvolvimento

```bash
npm run dev
```

Isso inicia o backend (porta 3000) e frontend (porta 5173) simultaneamente.

### Produção (Servidor Único)

```bash
# 1. Build de tudo
npm run build

# 2. Iniciar servidor único
npm start
```

Acesse `http://localhost:3000` - tudo funcionará em um único servidor!

## Usar no Smartphone

### 1. Descobrir IP da sua máquina

**Windows:**
```bash
ipconfig
```
Procure por "IPv4 Address" (ex: 192.168.1.100)

**Linux/Mac:**
```bash
ifconfig
# ou
ip addr
```

### 2. Iniciar servidor em produção

```bash
npm run build
npm start
```

### 3. Acessar do smartphone

1. Certifique-se que o smartphone está na mesma rede Wi-Fi
2. No navegador do smartphone, acesse: `http://SEU_IP:3000`
   - Exemplo: `http://192.168.1.100:3000`

### 4. Instalar como PWA

**Android (Chrome):**
- Menu (3 pontos) → "Adicionar à tela inicial" ou "Install app"

**iOS (Safari):**
- Compartilhar → "Adicionar à Tela de Início"

**Outros navegadores:**
- Procure por opção de "Instalar" ou "Add to Home Screen"

## Variáveis de Ambiente (Opcional)

Crie um arquivo `.env` na raiz do backend:

```
PORT=3000
CORS_ORIGIN=*
NODE_ENV=production
```

## Troubleshooting

### Service Worker não registra
- Verifique se está acessando via HTTPS ou localhost
- Service Workers requerem contexto seguro

### Não consegue acessar do smartphone
- Verifique firewall do Windows
- Certifique-se que está na mesma rede
- Tente desabilitar temporariamente o firewall para teste

### PWA não instala
- Verifique se o manifest.json está acessível
- Verifique se os ícones existem
- Use HTTPS em produção (ou localhost para desenvolvimento)

