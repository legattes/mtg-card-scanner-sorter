# 🔧 Como Resolver Problemas de Cache

Se você está vendo arquivos antigos ou erros 404 após fazer build, siga estes passos:

## 🚀 Solução Rápida

### 1. Limpar Cache do Navegador

**Chrome/Edge:**
- Pressione `Ctrl + Shift + Delete` (Windows) ou `Cmd + Shift + Delete` (Mac)
- Selecione "Imagens e arquivos em cache"
- Clique em "Limpar dados"
- **OU** Pressione `Ctrl + F5` para hard refresh

**Firefox:**
- Pressione `Ctrl + Shift + Delete`
- Selecione "Cache"
- Clique em "Limpar agora"
- **OU** Pressione `Ctrl + F5`

**Safari (iOS):**
- Vá em Configurações → Safari → Limpar Histórico e Dados do Site
- **OU** Feche e reabra o Safari

### 2. Desregistrar Service Worker

**Chrome/Edge:**
1. Abra DevTools (`F12`)
2. Vá na aba "Application" (Aplicativo)
3. No menu lateral, clique em "Service Workers"
4. Clique em "Unregister" para cada service worker listado
5. Vá em "Storage" → "Clear storage" → Marque tudo → "Clear site data"

**Firefox:**
1. Abra DevTools (`F12`)
2. Vá na aba "Application" (Aplicativo)
3. No menu lateral, clique em "Service Workers"
4. Clique em "Unregister" para cada service worker
5. Vá em "Storage" → "Clear All"

### 3. Rebuildar e Reiniciar

```bash
# 1. Rebuildar frontend
npm run build:frontend

# 2. Rebuildar backend
npm run build:backend
# ou
cd backend && npm run build

# 3. Reiniciar servidor
npm start
```

## 🔍 Verificação

Após limpar o cache, verifique:

1. Abra o DevTools (`F12`)
2. Vá na aba "Network" (Rede)
3. Marque "Disable cache"
4. Recarregue a página (`Ctrl + R` ou `F5`)
5. Verifique se os arquivos estão sendo carregados corretamente

## ⚠️ Mudanças Aplicadas

- ✅ Service Worker atualizado para `v2` (força atualização)
- ✅ Estratégia de cache alterada para "network-first" (busca da rede primeiro)
- ✅ Headers de no-cache adicionados para HTML/JS/CSS
- ✅ Cache antigo será limpo automaticamente

## 📝 Nota

O Service Worker agora usa uma estratégia "network-first", o que significa que sempre busca a versão mais recente da rede antes de usar o cache. Isso evita problemas de cache antigo.

