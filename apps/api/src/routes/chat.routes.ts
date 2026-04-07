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

  const messageLower = message.toLowerCase().trim();
  const messageClean = message.trim();
  const data: any = {};

  // Detectar email
  const emailMatch = messageClean.match(/[\w.-]+@[\w.-]+\.\w+/);
  if (emailMatch) {
    data.email = emailMatch[0];
  }

  // Detectar WhatsApp/telefone
  const phoneMatch = messageClean.match(/\(?\d{2}\)?\s?\d{4,5}-?\d{4}/);
  if (phoneMatch) {
    data.whatsapp = phoneMatch[0];
  }

  // Extrair nome
  if (!session.collectedData.nome) {
    // Padrões: "Meu nome é X", "Me chamo X", "Sou o/a X", "É X", "Nome: X"
    const nomePatterns = [
      /(?:meu nome é|me chamo|eu sou o|eu sou a|sou o|sou a|pode me chamar de|nome[:\s]+)\s*([A-Za-zÀ-ÿ]{2,}\s+[A-Za-zÀ-ÿ\s]{2,})/i,
      /(?:meu nome é|me chamo|eu sou o|eu sou a|sou o|sou a|pode me chamar de|nome[:\s]+)\s*([A-Za-zÀ-ÿ]{2,})/i,
    ];

    for (const pattern of nomePatterns) {
      const match = messageClean.match(pattern);
      if (match) {
        data.nome = match[1].trim();
        break;
      }
    }

    // Fallback: mensagem inteira é um nome (2-4 palavras, só letras)
    if (!data.nome && /^[A-Za-zÀ-ÿ\s]{3,50}$/.test(messageClean)) {
      const words = messageClean.split(/\s+/).filter(w => w.length > 0);
      if (words.length >= 2 && words.length <= 4) {
        data.nome = messageClean;
      }
    }
  }

  // Extrair empresa
  if (!session.collectedData.empresa) {
    // Padrões: "Trabalho na X", "empresa X", "da empresa X", "sou da X", "Empresa: X"
    const empresaPatterns = [
      /(?:trabalho na|trabalho no|empresa é|da empresa|sou da|sou do|empresa[:\s]+|é a empresa|na empresa)\s+([A-Za-z0-9À-ÿ\s&.-]{2,})/i,
    ];

    for (const pattern of empresaPatterns) {
      const match = messageClean.match(pattern);
      if (match) {
        data.empresa = match[1].trim().replace(/[.,!?]+$/, '');
        break;
      }
    }

    // Fallback: mensagem curta que parece nome de empresa
    if (!data.empresa && /^[A-Za-z0-9À-ÿ\s&.-]{2,60}$/.test(messageClean)) {
      const words = messageClean.split(/\s+/).filter(w => w.length > 0);
      if (words.length <= 5) {
        // Se o step atual é 6 (coleta de contato) e já temos nome, provavelmente é empresa
        if (session.currentStep >= 6 && session.collectedData.nome) {
          data.empresa = messageClean;
        }
        // Ou se contém keywords de empresa
        else if (/empresa|tech|consultoria|grupo|ltda|s\.a|soluções|digital|sistemas|educação|construtora|industria|indústria/i.test(messageLower)) {
          data.empresa = messageClean;
        }
      }
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

  // Mescla dados coletados pelo pattern matching com dados extraídos pela IA (IA como fallback)
  const aiLead = finalData?.dados_lead ?? {};
  const mergedData = {
    nome: collected.nome || aiLead.nome,
    email: collected.email || aiLead.email,
    whatsapp: collected.whatsapp || aiLead.whatsapp,
    empresa: collected.empresa || aiLead.empresa,
    setor: collected.setor || aiLead.setor,
    tamanho_equipe: collected.tamanho_equipe || aiLead.tamanho_equipe,
    desafio_principal: collected.desafio_principal || aiLead.desafio_principal,
    usa_plataforma: collected.usa_plataforma || aiLead.usa_plataforma,
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

export { router as chatRoutes };
