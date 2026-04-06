# ⚡ Quick Start - Woli Growth AI

## 🚀 Iniciar o Projeto (3 passos)

### 1️⃣ Instalar dependências
```bash
cd woli-growth-ai
npm install
```

### 2️⃣ Configurar banco de dados
```bash
cd apps/api
npm run db:generate
cd ../..
```

### 3️⃣ Iniciar o projeto
```bash
npm run dev
```

**Pronto!** Acesse: [http://localhost:5173](http://localhost:5173)

---

## 💬 Como usar o Wolerzito

1. Abra o site
2. Clique em **"💬 Iniciar conversa com o Wolerzito"** na seção Hero
   - OU clique no botão flutuante no canto inferior direito
3. Interaja com o chat usando os chips de sugestão ou digitando manualmente

---

## 🔍 Ver leads salvos no banco

```bash
cd apps/api
npm run db:studio
```
Acesse: [http://localhost:5555](http://localhost:5555)

---

## ✅ Checklist Rápido

- [ ] Node.js 18+ instalado
- [ ] Dependências instaladas (`npm install`)
- [ ] Prisma Client gerado (`npm run db:generate`)
- [ ] Projeto rodando (`npm run dev`)
- [ ] Chat funcionando na home
- [ ] Leads sendo salvos no banco

---

## 🆘 Problemas?

**Erro: "Cannot find module '@prisma/client'"**
```bash
cd apps/api
npm install
npm run db:generate
```

**Erro: "Port already in use"**
- Feche outros processos ou mude a porta no `.env`

**Chat não abre**
- Verifique se ambos backend (3333) e frontend (5173) estão rodando
- Veja o console do navegador (F12) para erros

---

Para documentação completa, consulte:
- [START.md](START.md) - Guia detalhado de inicialização
- [TESTE_WOLERZITO.md](TESTE_WOLERZITO.md) - Guia completo de testes
- [README.md](README.md) - Documentação geral do projeto
