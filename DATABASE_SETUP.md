# 🗄️ Configuração do Banco de Dados - Passo a Passo

## 📋 Visão Geral

O projeto usa **SQLite** com **Prisma ORM** para gerenciar o banco de dados.

- **SQLite**: Banco de dados em arquivo (não precisa de servidor)
- **Prisma**: ORM moderno que facilita operações no banco
- **Arquivo do banco**: `apps/api/dev.db` (criado automaticamente)

---

## 🔧 Passo 1: Configurar o .env

O arquivo `.env` configura onde o banco será criado.

**Localização:** `apps/api/.env`

```env
# Database Configuration
DATABASE_URL="file:./dev.db"

# Server Configuration
PORT=3333

# Woli AI API Configuration
WOLI_AI_API_URL=https://api-ia.woli.com.br
WOLI_AI_API_KEY=sua_chave_aqui
```

### Entendendo o DATABASE_URL

**Formato:**
```
DATABASE_URL="file:./caminho/arquivo.db"
```

**Exemplos:**
```env
# Arquivo na pasta atual (padrão - RECOMENDADO)
DATABASE_URL="file:./dev.db"

# Arquivo em pasta específica
DATABASE_URL="file:./database/woli.db"

# Caminho absoluto (não recomendado)
DATABASE_URL="file:/C:/projetos/woli/dados.db"

# Banco em memória (apaga ao reiniciar)
DATABASE_URL="file::memory:?cache=shared"
```

**Para produção:**
```env
# PostgreSQL (exemplo)
DATABASE_URL="postgresql://user:password@localhost:5432/woli_db"

# MySQL (exemplo)
DATABASE_URL="mysql://user:password@localhost:3306/woli_db"
```

---

## 🏗️ Passo 2: Criar o Schema

O schema define as tabelas e campos do banco.

**Localização:** `apps/api/prisma/schema.prisma`

**Já está criado no projeto!** Com a tabela `Lead` completa.

### Estrutura da Tabela Lead

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | String (UUID) | Identificador único |
| nome | String? | Nome do lead |
| email | String? | Email do lead |
| whatsapp | String? | Telefone/WhatsApp |
| empresa | String? | Nome da empresa |
| setor | String? | Setor de atuação |
| tamanho_equipe | String? | Tamanho da equipe |
| desafio_principal | String? | Desafio principal |
| usa_plataforma | String? | Plataforma atual |
| score | Int | Score de qualificação (0-100) |
| classificacao | String | QUALIFICADO/DESCARTADO/INCOMPLETO |
| status | String | EM_ANDAMENTO/FINALIZADO |
| resumo_conversa | String? | Resumo da conversa |
| pitch | String? | Pitch personalizado |
| historico_chat | String | JSON com histórico completo |
| criado_em | DateTime | Data de criação |
| atualizado_em | DateTime | Data de atualização |

---

## ⚙️ Passo 3: Instalar Dependências

```bash
cd woli-growth-ai/apps/api
npm install
```

Isso instala:
- `prisma` (CLI do Prisma)
- `@prisma/client` (Cliente para usar no código)

---

## 🔨 Passo 4: Gerar o Prisma Client

O Prisma Client é o código TypeScript que permite acessar o banco.

```bash
cd apps/api
npm run db:generate
```

**Ou:**
```bash
npx prisma generate
```

**O que isso faz:**
1. Lê o `schema.prisma`
2. Gera código TypeScript em `node_modules/@prisma/client`
3. Cria funções type-safe para usar no código

**Exemplo de código gerado:**
```typescript
const lead = await prisma.lead.create({
  data: {
    nome: "João Silva",
    email: "joao@empresa.com",
    empresa: "Empresa XYZ",
    score: 75,
    classificacao: "QUALIFICADO"
  }
})
```

---

## 🚀 Passo 5: Criar o Banco de Dados

### Opção A: Migrations (Recomendado para produção)

Migrations mantêm histórico de alterações no banco.

```bash
cd apps/api
npm run db:migrate
```

**Ou:**
```bash
npx prisma migrate dev --name init
```

**O que isso faz:**
1. Cria o arquivo `dev.db` (se não existir)
2. Cria as tabelas conforme o schema
3. Salva a migration em `prisma/migrations/`
4. Executa `prisma generate` automaticamente

### Opção B: Push (Rápido para desenvolvimento)

Push sincroniza o schema sem criar migrations.

```bash
cd apps/api
npx prisma db push
```

**O que isso faz:**
1. Cria o arquivo `dev.db` (se não existir)
2. Cria/atualiza as tabelas
3. **NÃO** cria histórico de migrations

---

## 🔍 Passo 6: Visualizar o Banco

O Prisma Studio é uma interface visual para ver e editar dados.

```bash
cd apps/api
npm run db:studio
```

**Ou:**
```bash
npx prisma studio
```

**Abre em:** [http://localhost:5555](http://localhost:5555)

**Interface:**
```
┌─────────────────────────────────────┐
│  Prisma Studio                      │
├─────────────────────────────────────┤
│  Models:                            │
│  └─ Lead (0 records)                │
│                                     │
│  [Adicionar registro] [Filtrar]    │
└─────────────────────────────────────┘
```

Você pode:
- ✅ Ver todos os leads salvos
- ✅ Editar campos manualmente
- ✅ Adicionar novos registros
- ✅ Deletar registros
- ✅ Filtrar e buscar

---

## 📊 Fluxo Visual Completo

```mermaid
graph TD
    A[.env] -->|DATABASE_URL| B[Prisma]
    C[schema.prisma] -->|Define estrutura| B
    B -->|prisma generate| D[Prisma Client]
    B -->|prisma migrate dev| E[dev.db criado]
    D -->|Importado em| F[código TypeScript]
    F -->|CRUD operations| E
    E -->|Visualizado em| G[Prisma Studio]
```

**Passo a passo:**

1. **Você configura** `.env` com `DATABASE_URL`
2. **Você define** estrutura no `schema.prisma`
3. **Você roda** `prisma generate` → cria o cliente
4. **Você roda** `prisma migrate dev` → cria o banco
5. **Seu código** usa o Prisma Client para salvar/buscar dados
6. **Os dados** são salvos em `dev.db`
7. **Você visualiza** com `prisma studio`

---

## 🎯 Como o Código Usa o Banco

### 1. Conexão (apps/api/src/utils/prisma.ts)

```typescript
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});
```

### 2. Criar Lead (apps/api/src/routes/chat.routes.ts)

```typescript
import { prisma } from '../utils/prisma';

// Criar novo lead
const lead = await prisma.lead.create({
  data: {
    historico_chat: JSON.stringify([]),
  },
});

console.log(lead.id); // UUID gerado automaticamente
```

### 3. Atualizar Lead

```typescript
// Atualizar após conversa finalizada
await prisma.lead.update({
  where: { id: leadId },
  data: {
    nome: "João Silva",
    email: "joao@empresa.com",
    empresa: "Empresa XYZ",
    score: 75,
    classificacao: "QUALIFICADO",
    status: "FINALIZADO",
    resumo_conversa: "Lead interessado...",
    pitch: "A Woli pode ajudar...",
    historico_chat: JSON.stringify(messages),
  },
});
```

### 4. Buscar Leads

```typescript
// Buscar todos os leads qualificados
const leads = await prisma.lead.findMany({
  where: {
    classificacao: 'QUALIFICADO',
    score: { gte: 60 }
  },
  orderBy: {
    criado_em: 'desc'
  }
});

// Buscar um lead específico
const lead = await prisma.lead.findUnique({
  where: { id: leadId }
});
```

---

## 🔄 Alterando o Schema no Futuro

Se precisar adicionar novos campos:

### 1. Editar schema.prisma

```prisma
model Lead {
  // ... campos existentes

  // Novo campo
  origem       String? // Ex: "website", "whatsapp", "email"
  pipeline_id  String? // ID do pipeline de vendas
}
```

### 2. Criar nova migration

```bash
npx prisma migrate dev --name add_origem_pipeline
```

### 3. Atualizar o código

```typescript
await prisma.lead.update({
  where: { id: leadId },
  data: {
    origem: "website",
    pipeline_id: "pipe_123"
  }
});
```

---

## 🚨 Comandos Úteis

```bash
# Gerar Prisma Client
npx prisma generate

# Criar/aplicar migrations
npx prisma migrate dev --name nome_da_migration

# Aplicar migrations em produção
npx prisma migrate deploy

# Sincronizar schema sem migrations
npx prisma db push

# Visualizar banco de dados
npx prisma studio

# Resetar banco (APAGA TUDO!)
npx prisma migrate reset

# Ver status das migrations
npx prisma migrate status

# Formatar schema.prisma
npx prisma format

# Validar schema
npx prisma validate
```

---

## 🆘 Troubleshooting

### ❌ Erro: "Cannot find module '@prisma/client'"

**Solução:**
```bash
cd apps/api
npm install
npm run db:generate
```

### ❌ Erro: "Database does not exist"

**Solução:**
```bash
cd apps/api
npm run db:migrate
```

### ❌ Erro: "Migration failed"

**Solução 1 - Reset (CUIDADO: apaga dados):**
```bash
npx prisma migrate reset
```

**Solução 2 - Forçar push:**
```bash
npx prisma db push --force-reset
```

### ❌ Banco não aparece no Prisma Studio

**Verifique:**
1. O arquivo `dev.db` existe em `apps/api/`?
2. O `.env` está correto?
3. Rode: `npx prisma db push`

---

## 📦 Para Produção

Para deploy em produção, considere:

### PostgreSQL (Recomendado)

```env
DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public"
```

### MySQL

```env
DATABASE_URL="mysql://user:password@host:3306/dbname"
```

### Migrations em Produção

```bash
# Não usar migrate dev
npx prisma migrate deploy
```

---

## 📚 Recursos

- [Documentação Prisma](https://www.prisma.io/docs)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)

---

**Pronto!** Agora você entende completamente como funciona o banco de dados do Wolerzito! 🎉
