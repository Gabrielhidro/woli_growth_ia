/**
 * Tipos relacionados ao chat do Wolerzito
 */

export interface ChatMessage {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatSession {
  sessionId: string;
  leadId: string;
  messages: ChatMessage[];
  messageCount: number;
  currentStep: number;
  collectedData: {
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
  createdAt: Date;
  lastActivity: Date;
  isActive: boolean;
}

export interface WolerzitoResponse {
  message: string;
  currentStep: number;
  shouldEnd: boolean;
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
  };
}
