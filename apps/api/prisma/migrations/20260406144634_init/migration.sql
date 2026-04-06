-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT,
    "email" TEXT,
    "whatsapp" TEXT,
    "empresa" TEXT,
    "setor" TEXT,
    "tamanho_equipe" TEXT,
    "desafio_principal" TEXT,
    "usa_plataforma" TEXT,
    "score" INTEGER NOT NULL DEFAULT 0,
    "classificacao" TEXT NOT NULL DEFAULT 'INCOMPLETO',
    "status" TEXT NOT NULL DEFAULT 'EM_ANDAMENTO',
    "resumo_conversa" TEXT,
    "pitch" TEXT,
    "historico_chat" TEXT NOT NULL,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "Lead_classificacao_idx" ON "Lead"("classificacao");

-- CreateIndex
CREATE INDEX "Lead_score_idx" ON "Lead"("score");

-- CreateIndex
CREATE INDEX "Lead_criado_em_idx" ON "Lead"("criado_em");
