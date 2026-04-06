# Woli Growth AI

Sistema de qualificação inteligente de leads para a Woli - plataforma de educação corporativa.

## Estrutura do Projeto

Este é um monorepo organizado com npm workspaces:

```
woli-growth-ai/
├── apps/
│   ├── web/          # Frontend React (Vite + TypeScript + TailwindCSS)
│   └── api/          # Backend Node.js (Express + TypeScript)
└── packages/
    └── shared/       # Tipos TypeScript compartilhados
```

## Pré-requisitos

- Node.js 18+
- npm 9+

## Instalação

```bash
# Na raiz do projeto
npm install
```

## Rodando o Projeto

### Desenvolvimento (frontend + backend)

```bash
npm run dev
```

Isso irá iniciar:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3333

### Apenas Frontend

```bash
npm run dev:web
```

### Apenas Backend

```bash
npm run dev:api
```

## Build

```bash
npm run build
```

## Estrutura dos Apps

### Frontend (`apps/web`)

- **Framework**: React 18 + Vite
- **Linguagem**: TypeScript
- **Estilização**: TailwindCSS
- **Roteamento**: React Router DOM

**Páginas:**
- `/` - Home (clone estático da woli.com.br)
- `/dashboard` - Dashboard (placeholder)

**Componentes:**
- `components/home/` - Componentes da landing page
- `components/ui/` - Componentes reutilizáveis (Button, Card)

### Backend (`apps/api`)

- **Framework**: Express
- **Linguagem**: TypeScript

**Endpoints:**
- `GET /health` - Health check

**Serviços:**
- `woli-ai.service.ts` - Cliente da API de IA da Woli (esqueleto)

### Shared (`packages/shared`)

Tipos TypeScript compartilhados:
- `Lead` - Dados do lead
- `LeadStatus` - Status de qualificação
- `LeadClassification` - Classificação (hot/warm/cold)
- `ChatMessage` - Mensagens do chat
- `ScoreBreakdown` - Detalhamento da pontuação

## Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env` e configure:

```env
PORT=3333
WOLI_AI_API_URL=       # URL da API de IA da Woli
WOLI_AI_API_KEY=       # Chave da API
DATABASE_URL=          # URL do banco de dados
JWT_SECRET=            # Secret para JWT
```

## Próximos Passos

1. **Prompt 1**: Implementar chat do Wolerzito com integração à API de IA
2. **Prompt 2**: Implementar lógica de qualificação e scoring de leads
3. **Prompt 3**: Implementar dashboard de gestão de leads
4. **Prompt 4**: Implementar autenticação e persistência

## Tecnologias

- **Frontend**: React, Vite, TypeScript, TailwindCSS, Lucide Icons
- **Backend**: Node.js, Express, TypeScript
- **Ferramentas**: npm workspaces, concurrently

## Cores da Marca

- **Rosa/Magenta (Primária)**: `#E91E63`
- **Rosa Escuro**: `#C2185B`
- **Rosa Claro**: `#F8BBD9`
- **Cinza Escuro**: `#1A1A2E`
- **Cinza**: `#6B7280`
