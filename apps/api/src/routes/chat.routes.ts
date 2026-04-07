/**
 * Rotas do Chat Qualificador (Wolerzito)
 */

import { Router, Request, Response } from 'express';
import { nanoid } from 'nanoid';
import { sessionService } from '../services/session.service';
import { woliAIService } from '../services/woli-ai.service';
import { calculateScore, determineClassificacao } from '../utils/scoring';
import { prisma } from '../utils/prisma';
import { ChatMessage } from '../types/chat.types';

const router = Router();

/**
 * POST /api/chat/start
 * Inicia uma nova sessão de chat
 */
router.post('/api/chat/start', async (req: Request, res: Response) => {
  try {
    // Cria um novo lead no banco
    const lead = await prisma.lead.create({
      data: {
        historico_chat: JSON.stringify([]),
      },
    });

    // Cria a sessão de chat
    const session = sessionService.createSession(lead.id);

    // Mensagem inicial do Wolerzito (RF02)
    const initialMessage: ChatMessage = {
      id: nanoid(),
      role: 'assistant',
      content: 'Oi! 👋 Sou o Wolerzito, assistente da Woli. Estamos aqui para ajudar empresas a criar treinamentos mais engajantes. Qual o principal desafio que você enfrenta hoje com capacitação de equipes?',
      timestamp: new Date(),
    };

    sessionService.addMessage(session.sessionId, initialMessage);

    res.json({
      sessionId: session.sessionId,
      leadId: lead.id,
      message: initialMessage.content,
      currentStep: 1,
    });
  } catch (error) {
    console.error('[Chat Start] Erro:', error);
    res.status(500).json({ error: 'Erro ao iniciar chat' });
  }
});

/**
 * POST /api/chat/message
 * Envia uma mensagem e recebe resposta do Wolerzito
 */
router.post('/api/chat/message', async (req: Request, res: Response) => {
  try {
    const { sessionId, message } = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({ error: 'sessionId e message são obrigatórios' });
    }

    // Recupera a sessão
    const session = sessionService.getSession(sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Sessão não encontrada ou expirada' });
    }

    // Verifica limite de mensagens (RN-05) — finaliza em vez de retornar erro
    if (sessionService.hasReachedMessageLimit(sessionId)) {
      await finalizeChat(sessionId);

      return res.json({
        message: 'Obrigado pela conversa! 😊 Em breve um especialista da Woli entra em contato.',
        currentStep: 7,
        shouldEnd: true,
      });
    }

    // Adiciona mensagem do usuário
    const userMessage: ChatMessage = {
      id: nanoid(),
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    sessionService.addMessage(sessionId, userMessage);

    // Extrai dados da mensagem (simples pattern matching)
    extractDataFromMessage(sessionId, message);

    // Detecta despedida do usuário
    if (isFarewellMessage(message)) {
      await finalizeChat(sessionId);

      return res.json({
        message: 'Foi ótimo conversar com você! 😊 Em breve um especialista da Woli entra em contato. Até mais!',
        currentStep: 7,
        shouldEnd: true,
      });
    }

    // Envia para a IA
    const aiResponse = await woliAIService.sendMessage(
      message,
      session.messages
    );

    // Adiciona resposta do assistente
    const assistantMessage: ChatMessage = {
      id: nanoid(),
      role: 'assistant',
      content: aiResponse.message,
      timestamp: new Date(),
    };

    sessionService.addMessage(sessionId, assistantMessage);
    sessionService.updateStep(sessionId, aiResponse.currentStep);

    // Se deve encerrar, processa finalização
    if (aiResponse.shouldEnd) {
      await finalizeChat(sessionId, aiResponse.finalData);

      return res.json({
        message: aiResponse.message,
        currentStep: aiResponse.currentStep,
        shouldEnd: true,
        finalData: aiResponse.finalData,
      });
    }

    res.json({
      message: aiResponse.message,
      currentStep: aiResponse.currentStep,
      shouldEnd: false,
    });
  } catch (error) {
    console.error('[Chat Message] Erro:', error);
    res.status(500).json({ error: 'Erro ao processar mensagem' });
  }
});

/**
 * POST /api/chat/end
 * Encerra uma sessão manualmente
 */
router.post('/api/chat/end', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId é obrigatório' });
    }

    const session = sessionService.getSession(sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Sessão não encontrada' });
    }

    // Calcula score e finaliza
    const scoringInput = session.collectedData;
    const scoringResult = calculateScore(scoringInput);

    const hasContact = Boolean(
      session.collectedData.nome &&
      session.collectedData.empresa &&
      (session.collectedData.email || session.collectedData.whatsapp)
    );

    const hasBusinessContext = Boolean(
      session.collectedData.desafio_principal ||
      session.collectedData.setor ||
      session.collectedData.tamanho_equipe
    );

    const classificacao = determineClassificacao(
      scoringResult.score,
      hasContact,
      hasBusinessContext
    );

    await finalizeChat(sessionId, {
      score: scoringResult.score,
      classificacao,
      status: 'FINALIZADO',
      resumo_conversa: 'Conversa encerrada pelo usuário.',
      pitch: 'A Woli pode ajudar sua empresa a criar treinamentos mais engajantes.',
    });

    res.json({
      message: 'Chat encerrado com sucesso',
      score: scoringResult.score,
      classificacao,
    });
  } catch (error) {
    console.error('[Chat End] Erro:', error);
    res.status(500).json({ error: 'Erro ao encerrar chat' });
  }
});

/**
 * GET /api/chat/session/:sessionId
 * Recupera informações de uma sessão
 */
router.get('/api/chat/session/:sessionId', (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    const session = sessionService.getSession(sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Sessão não encontrada' });
    }

    res.json({
      sessionId: session.sessionId,
      leadId: session.leadId,
      messageCount: session.messageCount,
      currentStep: session.currentStep,
      isActive: session.isActive,
      collectedData: session.collectedData,
    });
  } catch (error) {
    console.error('[Chat Session] Erro:', error);
    res.status(500).json({ error: 'Erro ao recuperar sessão' });
  }
});

/**
 * Detecta se a mensagem é uma despedida/encerramento do usuário
 */
function isFarewellMessage(message: string): boolean {
  const msg = message.toLowerCase().trim().replace(/[!.?]+$/, '').trim();
  const farewellExact = [
    'tchau', 'tchau tchau', 'bye', 'bye bye',
    'até mais', 'ate mais', 'até logo', 'ate logo',
    'falou', 'flw', 'vlw', 'valeu',
    'obrigado', 'obrigada', 'muito obrigado', 'muito obrigada',
    'brigado', 'brigada', 'thanks',
    'é isso', 'era isso', 'só isso', 'é só isso',
    'nada mais', 'por enquanto é isso',
  ];

  if (farewellExact.includes(msg)) return true;

  const farewellPatterns = [
    /^tchau/i,
    /^bye/i,
    /^até\s+(mais|logo|breve)/i,
    /^(muito\s+)?obrigad[oa]/i,
    /^valeu/i,
    /^era\s+isso/i,
    /^só\s+isso/i,
  ];

  return farewellPatterns.some(p => p.test(msg));
}

/**
 * Extrai apenas dados inequívocos da mensagem (email e telefone).
 * Nome, empresa, setor e demais campos são extraídos pela IA no dados_lead
 * ao final da conversa, pois a IA entende o contexto da pergunta.
 */
function extractDataFromMessage(sessionId: string, message: string): void {
  const session = sessionService.getSession(sessionId);
  if (!session) return;

  const messageClean = message.trim();
  const data: any = {};

  // Detectar email (padrão inequívoco)
  const emailMatch = messageClean.match(/[\w.-]+@[\w.-]+\.\w+/);
  if (emailMatch && !session.collectedData.email) {
    data.email = emailMatch[0];
  }

  // Detectar WhatsApp/telefone (padrão inequívoco)
  const phoneMatch = messageClean.match(/\(?\d{2}\)?\s?\d{4,5}-?\d{4}/);
  if (phoneMatch && !session.collectedData.whatsapp) {
    data.whatsapp = phoneMatch[0];
  }

  if (Object.keys(data).length > 0) {
    sessionService.updateCollectedData(sessionId, data);
  }
}

/**
 * Finaliza o chat e salva no banco
 */
async function finalizeChat(
  sessionId: string,
  finalData?: {
    score: number;
    classificacao: 'QUALIFICADO' | 'DESCARTADO' | 'INCOMPLETO';
    status: 'FINALIZADO';
    resumo_conversa: string;
    pitch: string;
    dados_lead?: {
      nome?: string;
      email?: string;
      whatsapp?: string;
      empresa?: string;
      setor?: string;
      tamanho_equipe?: string;
      desafio_principal?: string;
      usa_plataforma?: string;
      urgencia?: string;
    };
  }
): Promise<void> {
  const session = sessionService.getSession(sessionId);
  if (!session) return;

  const collected = session.collectedData;
  const historyJson = JSON.stringify(session.messages);

  // IA é a fonte primária para dados contextuais (nome, empresa, setor, etc.)
  // Regex só extrai email/whatsapp (padrões inequívocos) e serve de fallback
  const aiLead = finalData?.dados_lead ?? {};
  const mergedData = {
    nome: aiLead.nome || collected.nome,
    email: aiLead.email || collected.email,
    whatsapp: aiLead.whatsapp || collected.whatsapp,
    empresa: aiLead.empresa || collected.empresa,
    setor: aiLead.setor || collected.setor,
    tamanho_equipe: aiLead.tamanho_equipe || collected.tamanho_equipe,
    desafio_principal: aiLead.desafio_principal || collected.desafio_principal,
    usa_plataforma: aiLead.usa_plataforma || collected.usa_plataforma,
  };

  // Se não há finalData, calcula agora
  let score = finalData?.score ?? 0;
  let classificacao = finalData?.classificacao ?? 'INCOMPLETO';
  let resumo = finalData?.resumo_conversa ?? '';
  let pitch = finalData?.pitch ?? '';

  if (!finalData) {
    const scoringResult = calculateScore(mergedData);
    score = scoringResult.score;

    const hasContact = Boolean(
      mergedData.nome &&
      mergedData.empresa &&
      (mergedData.email || mergedData.whatsapp)
    );

    const hasBusinessContext = Boolean(
      mergedData.desafio_principal ||
      mergedData.setor ||
      mergedData.tamanho_equipe
    );

    classificacao = determineClassificacao(score, hasContact, hasBusinessContext);
  }

  // Atualiza o lead no banco
  await prisma.lead.update({
    where: { id: session.leadId },
    data: {
      nome: mergedData.nome,
      email: mergedData.email,
      whatsapp: mergedData.whatsapp,
      empresa: mergedData.empresa,
      setor: mergedData.setor,
      tamanho_equipe: mergedData.tamanho_equipe,
      desafio_principal: mergedData.desafio_principal,
      usa_plataforma: mergedData.usa_plataforma,
      score,
      classificacao,
      status: 'FINALIZADO',
      resumo_conversa: resumo,
      pitch,
      historico_chat: historyJson,
    },
  });

  // Encerra a sessão
  sessionService.endSession(sessionId);
}

// Registra callback para salvar dados quando sessão expira por inatividade
sessionService.setOnSessionExpired(async (session) => {
  const collected = session.collectedData;
  const historyJson = JSON.stringify(session.messages);

  const scoringResult = calculateScore(collected);
  const hasContact = Boolean(
    collected.nome && collected.empresa && (collected.email || collected.whatsapp)
  );
  const hasBusinessContext = Boolean(
    collected.desafio_principal || collected.setor || collected.tamanho_equipe
  );
  const classificacao = determineClassificacao(scoringResult.score, hasContact, hasBusinessContext);

  await prisma.lead.update({
    where: { id: session.leadId },
    data: {
      nome: collected.nome,
      email: collected.email,
      whatsapp: collected.whatsapp,
      empresa: collected.empresa,
      setor: collected.setor,
      tamanho_equipe: collected.tamanho_equipe,
      desafio_principal: collected.desafio_principal,
      usa_plataforma: collected.usa_plataforma,
      score: scoringResult.score,
      classificacao,
      status: 'FINALIZADO',
      resumo_conversa: 'Conversa encerrada por inatividade.',
      pitch: '',
      historico_chat: historyJson,
    },
  });

  console.log(`[Chat] Sessão ${session.sessionId} finalizada por inatividade — lead ${session.leadId} salvo.`);
});

export { router as chatRoutes };
