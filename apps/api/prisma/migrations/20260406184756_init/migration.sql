-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "nome" TEXT NOT NULL DEFAULT 'Admin',
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
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
    "historico_chat" TEXT NOT NULL DEFAULT '[]',
    "status_comercial" TEXT NOT NULL DEFAULT 'NOVO',
    "historico_status" TEXT NOT NULL DEFAULT '[]',
    "primeiro_visualizado_em" TIMESTAMP(3),
    "anotacoes_internas" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Lead_classificacao_idx" ON "Lead"("classificacao");

-- CreateIndex
CREATE INDEX "Lead_status_comercial_idx" ON "Lead"("status_comercial");

-- CreateIndex
CREATE INDEX "Lead_score_idx" ON "Lead"("score");

-- CreateIndex
CREATE INDEX "Lead_criado_em_idx" ON "Lead"("criado_em");
