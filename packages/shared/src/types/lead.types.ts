/**
 * Status do lead no funil de qualificação
 */
export type LeadStatus =
  | 'new'           // Lead acabou de entrar
  | 'qualifying'    // Em processo de qualificação via chat
  | 'qualified'     // Qualificado pelo sistema
  | 'unqualified'   // Não qualificado
  | 'contacted'     // Já foi contatado pelo time comercial
  | 'converted'     // Convertido em cliente
  | 'lost';         // Perdido/Desistiu

/**
 * Classificação de prioridade do lead
 */
export type LeadClassification =
  | 'hot'       // Alta prioridade - Urgente
  | 'warm'      // Média prioridade
  | 'cold';     // Baixa prioridade

/**
 * Detalhamento da pontuação do lead
 */
export interface ScoreBreakdown {
  companySize: number;        // Pontos pelo tamanho da empresa
  decisionPower: number;      // Pontos pelo poder de decisão
  budget: number;             // Pontos pelo orçamento disponível
  urgency: number;            // Pontos pela urgência
  engagement: number;         // Pontos pelo engajamento no chat
  fitScore: number;           // Pontos pelo fit com a solução
}

/**
 * Mensagem do chat entre lead e Wolerzito
 */
export interface ChatMessage {
  id: string;
  leadId: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
  metadata?: {
    intentDetected?: string;
    entitiesExtracted?: Record<string, string>;
    sentimentScore?: number;
  };
}

/**
 * Dados do lead
 */
export interface Lead {
  id: string;

  // Dados básicos
  name: string;
  email: string;
  phone?: string;
  company?: string;
  role?: string;

  // Dados de qualificação
  companySize?: string;           // Faixa de funcionários
  industry?: string;              // Setor de atuação
  currentSolution?: string;       // Solução atual de T&D
  painPoints?: string[];          // Dores identificadas
  budget?: string;                // Faixa de orçamento
  timeline?: string;              // Prazo para decisão
  decisionMaker?: boolean;        // É tomador de decisão?

  // Classificação
  status: LeadStatus;
  classification?: LeadClassification;
  totalScore: number;
  scoreBreakdown?: ScoreBreakdown;

  // Interação
  chatMessages: ChatMessage[];
  chatStartedAt?: Date;
  chatCompletedAt?: Date;
  lastInteractionAt?: Date;

  // Metadados
  source?: string;                // Origem do lead (landing page, etc)
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DTO para criação de novo lead
 */
export interface CreateLeadDTO {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  source?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

/**
 * DTO para envio de mensagem no chat
 */
export interface SendMessageDTO {
  leadId: string;
  content: string;
}

/**
 * Resposta da API do Wolerzito
 */
export interface WolerzitoChatResponse {
  message: ChatMessage;
  leadUpdates?: Partial<Lead>;
  suggestedQuestions?: string[];
  shouldEndChat?: boolean;
}
