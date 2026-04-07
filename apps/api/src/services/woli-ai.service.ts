import { env } from '../config/env';
import { ChatMessage, WolerzitoResponse } from '../types/chat.types';
import { WOLERZITO_SYSTEM_PROMPT } from '../prompts/wolerzito.prompt';

interface WoliAIApiResponse {
  output: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
}

/**
 * Serviço de integração com a API de IA da Woli
 * Docs: https://api-ia.woli.com.br
 *
 * Endpoint: POST /api/responses/generate
 * Auth:     Bearer <WOLI_AI_TOKEN>
 * Body:     { input: [{role, content}], model, temperature (0-10), max_tokens }
 * Response: { output: string, usage: {...}, model: string }
 */
export class WoliAIService {
  private readonly baseUrl: string;
  private readonly token: string;

  constructor() {
    this.baseUrl = env.WOLI_AI_API_URL;
    this.token = env.WOLI_AI_TOKEN;
  }

  /**
   * Envia a mensagem do usuário + histórico para a API e retorna a resposta do Wolerzito.
   * O system prompt é injetado automaticamente.
   */
  async sendMessage(
    userMessage: string,
    chatHistory: ChatMessage[]
  ): Promise<WolerzitoResponse> {
    if (!this.isConfigured()) {
      console.warn('[WoliAI] WOLI_AI_TOKEN não configurado — usando modo simulado.');
      return this.simulateResponse(chatHistory);
    }

    try {
      // Monta o array de mensagens no formato da API
      const input = [
        { role: 'system', content: WOLERZITO_SYSTEM_PROMPT },
        // Histórico (exclui o system message se já existir)
        ...chatHistory
          .filter(m => m.role !== 'system')
          .map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: userMessage },
      ];

      const response = await fetch(`${this.baseUrl}/api/responses/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify({
          input,
          model: 'gpt-4.1-mini',
          temperature: 7,
          max_tokens: 600,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Woli API ${response.status}: ${errorText}`);
      }

      const data: WoliAIApiResponse = await response.json();
      return this.parseOutput(data.output);
    } catch (error) {
      console.error('[WoliAI] Erro na chamada à API:', error);
      return this.simulateResponse(chatHistory);
    }
  }

  /**
   * Interpreta o output da IA.
   * Se o modelo retornar um bloco JSON com score/classificacao = resposta de finalização.
   * Caso contrário = mensagem intermediária.
   */
  private parseOutput(output: string): WolerzitoResponse {
    const jsonMatch = output.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.score !== undefined && parsed.classificacao) {
          return {
            message: parsed.finalMessage || 'Obrigado pela conversa!',
            currentStep: 7,
            shouldEnd: true,
            finalData: {
              score: parsed.score,
              classificacao: parsed.classificacao,
              status: 'FINALIZADO',
              resumo_conversa: parsed.resumo_conversa || '',
              pitch: parsed.pitch || '',
              dados_lead: parsed.dados_lead,
            },
          };
        }
      } catch {
        // não era JSON de finalização — trata como mensagem normal
      }
    }

    const currentStep = this.detectStep(output);
    return { message: output, currentStep, shouldEnd: false };
  }

  private detectStep(content: string): number {
    const c = content.toLowerCase();
    if (c.includes('nome completo') || c.includes('email') || c.includes('whatsapp') || c.includes('contato')) return 6;
    if (c.includes('quando') || c.includes('prazo') || c.includes('urgência') || c.includes('implementar')) return 5;
    if (c.includes('plataforma') || c.includes('ferramenta') || c.includes('usam hoje')) return 4;
    if (c.includes('tamanho') || c.includes('quantas pessoas') || c.includes('equipe')) return 3;
    if (c.includes('setor') || c.includes('segmento') || c.includes('ramo')) return 2;
    return 1;
  }

  /** Respostas simuladas — usadas quando WOLI_AI_TOKEN não está configurado */
  private simulateResponse(chatHistory: ChatMessage[]): WolerzitoResponse {
    const step = chatHistory.filter(m => m.role === 'user').length + 1;

    const responses: Record<number, WolerzitoResponse> = {
      1: { message: 'Entendo! E qual o tamanho da equipe que precisa ser treinada?', currentStep: 3, shouldEnd: false },
      2: { message: 'Legal! Vocês usam alguma plataforma de treinamentos hoje?', currentStep: 4, shouldEnd: false },
      3: { message: 'E em quanto tempo gostariam de implementar uma solução?', currentStep: 5, shouldEnd: false },
      4: { message: 'Perfeito! Para conectar com um especialista, qual seu nome completo?', currentStep: 6, shouldEnd: false },
      5: { message: 'Ótimo! E qual o melhor contato — email ou WhatsApp?', currentStep: 6, shouldEnd: false },
      6: { message: 'Anotado! E qual o nome da empresa?', currentStep: 6, shouldEnd: false },
    };

    if (step <= 6) return responses[step] ?? responses[1];

    return {
      message: 'Perfeito! 🎉 Em breve um especialista da Woli vai entrar em contato. Obrigado pela conversa!',
      currentStep: 7,
      shouldEnd: true,
      finalData: {
        score: 70,
        classificacao: 'QUALIFICADO',
        status: 'FINALIZADO',
        resumo_conversa: 'Lead interessado em solução de treinamentos corporativos.',
        pitch: 'A Woli pode transformar seus treinamentos em experiências engajantes.',
      },
    };
  }

  isConfigured(): boolean {
    return Boolean(this.baseUrl && this.token);
  }
}

export const woliAIService = new WoliAIService();
