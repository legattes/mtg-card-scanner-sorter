# 🔒 Configuração HTTPS para iOS

iOS Safari requer **HTTPS** para:
- ✅ Acesso à câmera (exceto localhost)
- ✅ Instalação de PWA
- ✅ Service Worker funcionando corretamente

## 🚀 Opção 1: ngrok (Rápido para Testes)

### Instalação
```bash
# Windows (via Chocolatey)
choco install ngrok

# Ou baixe de: https://ngrok.com/download
```

### Uso
1. Inicie o servidor em produção:
```bash
npm run build
npm start
```

2. Em outro terminal, execute:
```bash
ngrok http 3000
```

3. Você receberá uma URL HTTPS como: `https://abc123.ngrok.io`

4. **Acesse essa URL no seu iPhone** - tudo funcionará!

### Limitações
- URL muda a cada execução (versão gratuita)
- Pode ter limites de uso
- Ideal apenas para testes

---

## 🔧 Opção 2: HTTPS Local com Certificados Auto-assinados

### Passo 1: Gerar Certificados SSL

#### Windows (usando OpenSSL ou Git Bash):
```bash
# Instalar OpenSSL (se não tiver)
# Baixe de: https://slproweb.com/products/Win32OpenSSL.html

# Criar diretório para certificados
mkdir backend\certs
cd backend\certs

# Gerar chave privada
openssl genrsa -out key.pem 2048

# Gerar certificado auto-assinado (válido por 365 dias)
openssl req -new -x509 -key key.pem -out cert.pem -days 365 -subj "/CN=localhost"
```

### Passo 2: Configurar NestJS para HTTPS

Instalar dependência:
```bash
cd backend
npm install --save-dev @types/node
```

Modificar `backend/src/main.ts`:
```typescript
import * as https from 'https';
import * as fs from 'fs';
import { join } from 'path';

// ... código existente ...

async function bootstrap() {
  // ... código existente até app.listen ...
  
  const port = process.env.PORT || 3000;
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    // Tentar usar HTTPS se certificados existirem
    const certPath = join(__dirname, '..', 'certs', 'cert.pem');
    const keyPath = join(__dirname, '..', 'certs', 'key.pem');
    
    if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
      const httpsOptions = {
        cert: fs.readFileSync(certPath),
        key: fs.readFileSync(keyPath),
      };
      
      const server = https.createServer(httpsOptions, app.getHttpAdapter().getInstance());
      await server.listen(port);
      console.log(`🚀 Servidor HTTPS rodando em https://localhost:${port}`);
    } else {
      await app.listen(port);
      console.log(`🚀 Servidor HTTP rodando em http://localhost:${port}`);
      console.log(`⚠️  Para HTTPS, gere certificados em backend/certs/`);
    }
  } else {
    await app.listen(port);
    console.log(`🚀 Servidor rodando em http://localhost:${port}`);
  }
  
  // ... resto do código ...
}
```

### Passo 3: Aceitar Certificado no iPhone

1. Acesse `https://SEU_IP:3000` no iPhone
2. Safari mostrará aviso de segurança
3. Toque em "Avançar" ou "Detalhes" → "Visitar Site"
4. O certificado será aceito (apenas para testes)

---

## 📱 Opção 3: Usar IP Local (Apenas para Testes)

**Funciona apenas para testes básicos** (sem câmera/PWA completo):

1. Descubra o IP do seu computador:
```bash
# Windows
ipconfig
# Procure por "IPv4 Address" na sua conexão Wi-Fi
```

2. No iPhone, acesse: `http://SEU_IP:3000`

**Limitações:**
- ❌ Câmera não funcionará (requer HTTPS)
- ❌ PWA não instalará automaticamente
- ✅ Interface funcionará normalmente

---

## 🎯 Recomendação

Para **desenvolvimento/testes**: Use **ngrok** (Opção 1) - é mais rápido e fácil.

Para **produção real**: Configure HTTPS adequado com certificados válidos (Let's Encrypt, etc.).

---

## 📝 Notas Importantes

- **localhost** sempre funciona sem HTTPS (apenas no mesmo dispositivo)
- **IP local** requer HTTPS para câmera/PWA no iOS
- Certificados auto-assinados geram avisos de segurança (normal para testes)
- Em produção, use certificados válidos (Let's Encrypt, Cloudflare, etc.)

