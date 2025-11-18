# Ícones PWA

Para completar a configuração PWA, você precisa criar dois ícones PNG:

- **icon-192.png** (192x192 pixels)
- **icon-512.png** (512x512 pixels)

## Opções para Criar os Ícones

### Opção 1: Gerador Online (Recomendado)
1. Acesse: https://www.pwabuilder.com/imageGenerator
2. Faça upload de uma imagem (pode ser qualquer logo/imagem relacionada a MTG)
3. Baixe os ícones gerados
4. Renomeie para `icon-192.png` e `icon-512.png`
5. Coloque em `frontend/public/`

### Opção 2: Criar Manualmente
Use qualquer editor de imagens (Photoshop, GIMP, Canva, etc.) para criar:
- Um ícone 192x192 pixels
- Um ícone 512x512 pixels
- Salve como PNG
- Coloque em `frontend/public/`

### Opção 3: Usar Placeholder Temporário
Por enquanto, você pode copiar qualquer imagem PNG e renomear, mas o ideal é ter ícones personalizados.

## Estrutura Final

```
frontend/public/
  ├── icon-192.png  ← Criar este arquivo
  ├── icon-512.png  ← Criar este arquivo
  ├── manifest.json (já criado)
  └── sw.js (já criado)
```

