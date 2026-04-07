/**
 * Gerenciamento de sessões de chat em memória
 * Para produção, considerar usar Redis ou similar
 */

import { nanoid } from 'nanoid';
import { ChatSession, ChatMessage } from '../types/chat.types';

class SessionService {
  private sessions: Map<string, ChatSession> = new Map();
  private readonly SESSION_TIMEOUT = 10 * 60 * 1000; // 10 minutos (RN-04, RF09)
  private readonly MAX_MESSAGES = 20; // RN-05
  private onSessionExpired?: (session: ChatSession) => Promise<void>;

  constructor() {
    // Limpar sessões expiradas a cada 2 minutos
    setInterval(() => this.cleanupExpiredSessions(), 2 * 60 * 1000);
  }

  /**
   * Registra callback para quando uma sessão expira por inatividade.
   * Permite salvar os dados no banco antes de limpar a sessão.
   */
  setOnSessionExpired(callback: (session: ChatSession) => Promise<void>): void {
    this.onSessionExpired = callback;
  }

  /**
   * Cria uma nova sessão de chat
   */
  createSession(leadId: string): ChatSession {
    const sessionId = nanoid();
    const now = new Date();

    const session: ChatSession = {
      sessionId,
      leadId,
      messages: [],
      messageCount: 0,
      currentStep: 1,
      collectedData: {},
      createdAt: now,
      lastActivity: now,
      isActive: true,
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  /**
   * Recupera uma sessão pelo ID
   */
  getSession(sessionId: string): ChatSession | undefined {
    const session = this.sessions.get(sessionId);

    if (!session) return undefined;

    // Verificar se a sessão expirou
    const now = Date.now();
    const lastActivity = session.lastActivity.getTime();

    if (now - lastActivity > this.SESSION_TIMEOUT) {
      this.endSession(sessionId);
      return undefined;
    }

    return session;
  }

  /**
   * Adiciona uma mensagem à sessão
   */
  addMessage(sessionId: string, message: ChatMessage): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Sessão não encontrada');
    }

    session.messages.push(message);

    // Incrementar contador apenas para mensagens do usuário
    if (message.role === 'user') {
      session.messageCount++;
    }

    session.lastActivity = new Date();
  }

  /**
   * Atualiza os dados coletados na sessão
   */
  updateCollectedData(
    sessionId: string,
    data: Partial<ChatSession['collectedData']>
  ): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Sessão não encontrada');
    }

    session.collectedData = {
      ...session.collectedData,
      ...data,
    };

    session.lastActivity = new Date();
  }

  /**
   * Atualiza o passo atual da conversa
   */
  updateStep(sessionId: string, step: number): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Sessão não encontrada');
    }

    session.currentStep = step;
    session.lastActivity = new Date();
  }

  /**
   * Verifica se a sessão atingiu o limite de mensagens
   */
  hasReachedMessageLimit(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return true;

    return session.messageCount >= this.MAX_MESSAGES;
  }

  /**
   * Encerra uma sessão
   */
  endSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.isActive = false;
    }
  }

  /**
   * Remove uma sessão completamente
   */
  deleteSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  /**
   * Limpa sessões expiradas, salvando dados no banco antes de remover
   */
  private async cleanupExpiredSessions(): Promise<void> {
    const now = Date.now();

    for (const [sessionId, session] of this.sessions.entries()) {
      const lastActivity = session.lastActivity.getTime();

      if (now - lastActivity > this.SESSION_TIMEOUT) {
        console.log(`[SessionService] Sessão expirada: ${sessionId}`);

        // Salva dados no banco antes de limpar
        if (this.onSessionExpired && session.isActive) {
          try {
            await this.onSessionExpired(session);
          } catch (error) {
            console.error(`[SessionService] Erro ao finalizar sessão expirada ${sessionId}:`, error);
          }
        }

        this.sessions.delete(sessionId);
      }
    }
  }

  /**
   * Retorna o número de sessões ativas
   */
  getActiveSessionsCount(): number {
    return Array.from(this.sessions.values()).filter(s => s.isActive).length;
  }
}

// Singleton
export const sessionService = new SessionService();
