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

    // Verifica limite de mensagens (RN-05)
    if (sessionService.hasReachedMessageLimit(sessionId)) {
      return res.status(400).json({
        error: 'Limite de mensagens atingido',
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
 * Extrai dados estruturados da mensagem do usuário
 */
function extractDataFromMessage(sessionId: string, message: string): void {
  const session = sessionService.getSession(sessionId);
  if (!session) return;

  const messageLower = message.toLowerCase();
  const data: any = {};

  // Detectar email
  const emailMatch = message.match(/[\w.-]+@[\w.-]+\.\w+/);
  if (emailMatch) {
    data.email = emailMatch[0];
  }

  // Detectar WhatsApp/telefone
  const phoneMatch = message.match(/\(?\d{2}\)?\s?\d{4,5}-?\d{4}/);
  if (phoneMatch) {
    data.whatsapp = phoneMatch[0];
  }

  // Se não tem nome ainda e a mensagem parece ser um nome (2-4 palavras, sem números)
  if (!session.collectedData.nome && /^[A-Za-zÀ-ÿ\s]{3,50}$/.test(message) && message.split(' ').length >= 2) {
    data.nome = message;
  }

  // Se for uma palavra só de mais de 3 letras e não tem empresa ainda, pode ser empresa
  if (!session.collectedData.empresa && !session.collectedData.nome && /^[A-Za-z0-9À-ÿ\s]{3,}$/.test(message)) {
    // Se contém palavras como "empresa", "consultoria", "tech", etc
    if (messageLower.includes('empresa') || messageLower.includes('tech') || messageLower.includes('consultoria') ||
        messageLower.includes('grupo') || messageLower.includes('ltda') || messageLower.includes('s.a')) {
      data.empresa = message;
    }
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
  }
): Promise<void> {
  const session = sessionService.getSession(sessionId);
  if (!session) return;

  const collected = session.collectedData;
  const historyJson = JSON.stringify(session.messages);

  // Se não há finalData, calcula agora
  let score = finalData?.score ?? 0;
  let classificacao = finalData?.classificacao ?? 'INCOMPLETO';
  let resumo = finalData?.resumo_conversa ?? '';
  let pitch = finalData?.pitch ?? '';

  if (!finalData) {
    const scoringResult = calculateScore(collected);
    score = scoringResult.score;

    const hasContact = Boolean(
      collected.nome &&
      collected.empresa &&
      (collected.email || collected.whatsapp)
    );

    const hasBusinessContext = Boolean(
      collected.desafio_principal ||
      collected.setor ||
      collected.tamanho_equipe
    );

    classificacao = determineClassificacao(score, hasContact, hasBusinessContext);
  }

  // Atualiza o lead no banco
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

export { router as chatRoutes };
