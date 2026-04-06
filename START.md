# 🚀 Como Iniciar o Projeto Woli Growth AI

## Pré-requisitos
- Node.js 18+ instalado
- npm ou yarn

## 🎯 Primeira vez rodando o projeto?

### 1. Instalar todas as dependências
```bash
cd woli-growth-ai
npm install
```

### 2. Gerar o Prisma Client
```bash
cd apps/api
npm run db:generate
npm run db:migrate
cd ../..
```

### 3. Rodar o projeto

**Opção 1 - Usar o comando integrado (recomendado):**
```bash
npm run dev
```
Isso iniciará o backend (porta 3333) e frontend (porta 5173) simultaneamente.

**Opção 2 - Rodar em terminais separados:**

Terminal 1 - Backend:
```bash
npm run dev:api
```

Terminal 2 - Frontend:
```bash
npm run dev:web
```

### 4. Acessar o projeto
- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:3333](http://localhost:3333)
- **Health Check:** [http://localhost:3333/health](http://localhost:3333/health)

## 💬 Testando o Wolerzito

1. Abra [http://localhost:5173](http://localhost:5173)
2. Na seção Hero, clique em **"💬 Iniciar conversa com o Wolerzito"**
   OU
   Clique no botão flutuante no canto inferior direito
3. O chat abrirá automaticamente com a mensagem inicial
4. Interaja com os chips de sugestão ou digite suas respostas

## 🗄️ Visualizar banco de dados

Para ver os leads salvos no banco SQLite:
```bash
cd apps/api
npm run db:studio
```
Acesse: [http://localhost:5555](http://localhost:5555)

## ⚙️ Configuração da API de IA (Opcional)

O sistema funciona em **modo de simulação** por padrão (sem precisar de API externa).

Se quiser usar a API real da Woli, edite `apps/api/.env`:
```env
WOLI_AI_API_URL=https://api-ia.woli.com.br
WOLI_AI_API_KEY=sua_chave_aqui
```

## 🐛 Problemas comuns

### "Cannot find module '@prisma/client'"
```bash
cd apps/api
npm install
npm run db:generate
```

### "Port 3333 already in use"
Mate o processo que está usando a porta:
```bash
# Windows
netstat -ano | findstr :3333
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3333 | xargs kill -9
```

### "Database not found"
```bash
cd apps/api
npm run db:migrate
```

## 📚 Próximos passos

Leia o [TESTE_WOLERZITO.md](TESTE_WOLERZITO.md) para ver todos os cenários de teste e validação.

---

**Dúvidas?** Consulte a documentação completa no README.md
