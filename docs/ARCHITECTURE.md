# Arquitetura do Projeto

## Estrutura de Diretórios

```
backend/src/
├── domain/              # Entidades e interfaces de domínio
│   ├── entities/        # Entidades de negócio
│   └── interfaces/      # Interfaces/contratos
├── application/         # Casos de uso e lógica de aplicação
│   ├── use-cases/       # Casos de uso
│   └── services/        # Serviços de aplicação
├── infrastructure/      # Implementações concretas
│   ├── video-input/     # Implementações de entrada de vídeo
│   ├── data-storage/    # Armazenamento de dados
│   ├── export/          # Exportação de dados
│   └── ocr/             # Implementação OCR
└── interfaces/          # Camada de apresentação
    ├── http/            # Controllers HTTP
    └── dto/             # Data Transfer Objects
```

## Camadas

### Domain (Domínio)
- Entidades puras de negócio
- Interfaces/contratos
- Sem dependências externas

### Application (Aplicação)
- Casos de uso
- Orquestração de lógica
- Depende apenas do Domain

### Infrastructure (Infraestrutura)
- Implementações concretas
- Webcam, File System, OCR, etc.
- Implementa interfaces do Domain

### Interfaces (Apresentação)
- Controllers HTTP
- DTOs
- Validação de entrada

## Abstrações Principais

### VideoInput
Interface para diferentes fontes de vídeo:
- WebcamInput (navegador)
- MobileCameraInput (celular)
- FileInput (arquivo de vídeo)
- StreamInput (streaming)

### DataExport
Interface para exportação:
- JsonExport
- CsvExport
- ExcelExport

### DataRepository
Interface para armazenamento:
- FileRepository (atual)
- DatabaseRepository (futuro)

