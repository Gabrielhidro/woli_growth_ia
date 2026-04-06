# 🧪 Guia de Teste do Wolerzito (Módulo 1)

Este documento descreve como testar o **Chat Qualificador (Wolerzito)** implementado no Módulo 1 do projeto Woli Growth AI.

## 🎯 O que foi implementado

### Backend (apps/api)
- ✅ **Banco de dados SQLite** com Prisma
- ✅ **Schema Lead** completo conforme especificação
- ✅ **System Prompt do Wolerzito** (baseado no documento)
- ✅ **Service de IA** com modo de simulação (fallback se API não configurada)
- ✅ **Gerenciamento de sessões** em memória (timeout 10 min)
- ✅ **Lógica de scoring** nas 4 dimensões (tamanho, urgência, fit, maturidade)
- ✅ **Endpoints do chat**:
  - `POST /api/chat/start` - Inicia sessão
  - `POST /api/chat/message` - Envia mensagem
  - `POST /api/chat/end` - Encerra manualmente
  - `GET /api/chat/session/:id` - Consulta sessão

### Frontend (apps/web)
- ✅ **Componente WolerzitoChat** completo e funcional
- ✅ **Zustand store** para gerenciamento de estado
- ✅ **Chips de sugestão** por passo (conforme documento)
- ✅ **Indicador de digitação** ("Wolerzito está digitando...")
- ✅ **Design responsivo** (mobile-first)
- ✅ **Animações suaves** (fade-in, bounce)
- ✅ **Botão de reiniciar conversa**

### Regras de Negócio Implementadas
- ✅ **RN-01**: Cobre setor, tamanho, desafio, plataforma atual, urgência
- ✅ **RN-02**: Tom consultivo (via system prompt)
- ✅ **RN-03**: Score 0-100 em 4 dimensões
- ✅ **RN-04**: Classificação em QUALIFICADO/DESCARTADO/INCOMPLETO
- ✅ **RN-05**: Máximo 8 trocas de mensagem
- ✅ **RN-06**: Nome + (email OU whatsapp) + empresa obrigatórios
- ✅ **RN-10**: Resumo + pitch gerados ao encerrar

### Requisitos Funcionais Implementados
- ✅ **RF01**: Chat embutido na landing page
- ✅ **RF02**: Mensagem inicial automática
- ✅ **RF03**: Uma pergunta por mensagem (via prompt)
- ✅ **RF04**: Score calculado
- ✅ **RF05**: Classificação automática
- ✅ **RF06**: Coleta de contato
- ✅ **RF07**: Indicador de digitação
- ✅ **RF08**: Responsivo
- ✅ **RF09**: Timeout 10 minutos
- ✅ **RF10**: Botão reiniciar

## 🚀 Como rodar o projeto

### 1. Instalar dependências

```bash
cd woli-growth-ai
npm install
```

### 2. Configurar variáveis de ambiente

O arquivo `.env` já está configurado com SQLite. Se quiser usar a API de IA da Woli (opcional), adicione:

```
WOLI_AI_API_URL=https://api.woli.com/v1/chat
WOLI_AI_API_KEY=sua_chave_aqui
```

**Importante**: Se não configurar, o sistema usará o modo de simulação (mock) automaticamente.

### 3. Rodar o projeto

Em terminais separados:

```bash
# Terminal 1 - Backend
npm run dev:api

# Terminal 2 - Frontend
npm run dev:web
```

Acesse: [http://localhost:5173](http://localhost:5173)

## ✅ Checklist de Testes

### Teste 1: Inicialização do Chat
1. Abra a home da Woli
2. Clique no botão flutuante de chat no canto inferior direito
3. ✅ O chat deve abrir com a mensagem inicial do Wolerzito
4. ✅ Deve aparecer chips de sugestão (8 opções de desafios)

### Teste 2: Fluxo Completo de Qualificação
1. **Passo 1 - Desafio**: Clique em "Baixo engajamento nos treinamentos"
2. ✅ Wolerzito responde e avança para o próximo passo
3. ✅ Aparecem chips de setor (10 opções)

4. **Passo 2 - Setor**: Clique em "Tecnologia"
5. ✅ Wolerzito responde

6. **Passo 3 - Tamanho**: Clique em "51-200 pessoas"
7. ✅ Wolerzito responde

8. **Passo 4 - Plataforma**: Clique em "Google Drive / OneDrive"
9. ✅ Wolerzito responde

10. **Passo 5 - Urgência**: Clique em "Nos próximos 1-3 meses"
11. ✅ Wolerzito responde

12. **Passo 6 - Contato**: Digite seu nome completo
13. ✅ Wolerzito pede email ou WhatsApp (SEM chips neste passo)

14. Digite seu email
15. ✅ Wolerzito pede o nome da empresa

16. Digite o nome da empresa
17. ✅ Chat encerra com mensagem de confirmação
18. ✅ Aparece botão "Iniciar nova conversa"

### Teste 3: Chips "Ver mais"
1. No **Passo 1** (desafios), observe que aparecem apenas 4 chips + botão "Ver mais +4"
2. Clique em "Ver mais"
3. ✅ Todos os 8 chips aparecem

4. No **Passo 2** (setor), observe que aparecem apenas 4 chips + botão "Ver mais +6"
5. Clique em "Ver mais"
6. ✅ Todos os 10 chips aparecem

### Teste 4: Input Manual (sem chips)
1. Reinicie o chat
2. Em vez de clicar nos chips, digite respostas manualmente:
   - "Nossos treinamentos não engajam"
   - "Trabalhamos com varejo"
   - "Temos 150 colaboradores"
   - etc.
3. ✅ O chat deve funcionar normalmente

### Teste 5: Responsividade Mobile
1. Abra as DevTools do navegador (F12)
2. Ative o modo mobile (375x667 - iPhone)
3. Clique no botão de chat
4. ✅ O chat deve ocupar a tela inteira no mobile
5. ✅ Chips devem empilhar verticalmente
6. ✅ Tudo deve ser navegável

### Teste 6: Indicador de Digitação
1. Envie qualquer mensagem
2. ✅ Deve aparecer "Wolerzito está digitando..." com 3 bolinhas animadas
3. ✅ Após ~1 segundo, a resposta aparece

### Teste 7: Botão Reiniciar
1. Durante a conversa, clique no ícone ⟳ no header do chat
2. ✅ O chat deve reiniciar do zero

### Teste 8: Timeout de Sessão
1. Inicie uma conversa
2. Aguarde 10 minutos sem interagir
3. Tente enviar uma mensagem
4. ✅ Deve retornar erro de "Sessão expirada" (backend)

### Teste 9: Verificar Lead Salvo no Banco
1. Complete um fluxo de qualificação
2. Abra o Prisma Studio:
   ```bash
   cd woli-growth-ai/apps/api
   npm run db:studio
   ```
3. Acesse [http://localhost:5555](http://localhost:5555)
4. Navegue até a tabela `Lead`
5. ✅ Deve haver um registro com:
   - Nome, email/whatsapp, empresa preenchidos
   - Score calculado (ex: 70)
   - Classificação (QUALIFICADO/DESCARTADO/INCOMPLETO)
   - Status: FINALIZADO
   - historico_chat em JSON
   - resumo_conversa e pitch (se disponíveis)

### Teste 10: Scoring Correto
Verifique se o score está sendo calculado corretamente:

**Exemplo 1: Lead Qualificado (Score ~75)**
- Tamanho: 51-200 pessoas → 20 pontos
- Urgência: 1-3 meses → 20 pontos
- Fit: "baixo engajamento" → 30 pontos
- Maturidade: "Google Drive" → 15 pontos
- **Total: 85 pontos → QUALIFICADO**

**Exemplo 2: Lead Descartado (Score ~20)**
- Tamanho: 1-10 pessoas → 5 pontos
- Urgência: "apenas explorando" → 5 pontos
- Fit: desafio genérico → 10 pontos
- Maturidade: "não tem nada" → 5 pontos
- **Total: 25 pontos → DESCARTADO (se score < 40)**

## 🐛 Problemas Conhecidos / Limitações

1. **Modo de Simulação**: Por padrão, o sistema usa respostas simuladas (não chama a API de IA real da Woli). Para usar a API real, configure `WOLI_AI_API_URL` e `WOLI_AI_API_KEY`.

2. **Sessões em Memória**: As sessões são armazenadas em memória no backend. Se o servidor reiniciar, todas as sessões ativas são perdidas (esperado para MVP).

3. **Extração de Dados**: A extração automática de nome, email, empresa das mensagens usa regex simples. Pode não capturar 100% dos casos complexos.

4. **Resumo e Pitch**: No modo de simulação, estes campos são genéricos. Com a API real de IA, serão personalizados.

## 📊 Estrutura do Banco de Dados

```sql
-- Tabela Lead (SQLite)
CREATE TABLE Lead (
  id TEXT PRIMARY KEY,
  nome TEXT,
  email TEXT,
  whatsapp TEXT,
  empresa TEXT,
  setor TEXT,
  tamanho_equipe TEXT,
  desafio_principal TEXT,
  usa_plataforma TEXT,
  score INTEGER DEFAULT 0,
  classificacao TEXT DEFAULT 'INCOMPLETO',
  status TEXT DEFAULT 'EM_ANDAMENTO',
  resumo_conversa TEXT,
  pitch TEXT,
  historico_chat TEXT,  -- JSON stringified
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME
);
```

## 🎨 Personalização do Chat

Para personalizar o visual do chat, edite:

- **Cores**: [apps/web/tailwind.config.js](apps/web/tailwind.config.js)
- **Animações**: [apps/web/src/styles/index.css](apps/web/src/styles/index.css)
- **Mensagens**: [apps/api/src/prompts/wolerzito.prompt.ts](apps/api/src/prompts/wolerzito.prompt.ts)
- **Chips**: [apps/web/src/components/wolerzito/ChatSuggestionChips.tsx](apps/web/src/components/wolerzito/ChatSuggestionChips.tsx)

## 📝 Próximos Passos (Módulo 2)

O Módulo 2 incluirá:
- Dashboard de leads qualificados
- Filtros e busca
- Detalhes do lead com histórico do chat
- Exportação de dados

---

**Desenvolvido com ❤️ para o hackathon Woli Growth AI**
