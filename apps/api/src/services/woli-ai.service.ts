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

  /**
   * Respostas simuladas — usadas quando WOLI_AI_TOKEN não está configurado.
   *
   * Fluxo de conversa (a mensagem inicial do /api/chat/start pergunta sobre desafio):
   *   Msg 1 do user → resposta ao desafio     → bot pergunta setor
   *   Msg 2 do user → resposta ao setor       → bot pergunta tamanho equipe
   *   Msg 3 do user → resposta ao tamanho     → bot pergunta plataforma
   *   Msg 4 do user → resposta à plataforma   → bot pergunta urgência
   *   Msg 5 do user → resposta à urgência     → bot pede nome
   *   Msg 6 do user → resposta com nome       → bot pede email ou whatsapp
   *   Msg 7 do user → resposta com contato    → bot pede empresa
   *   Msg 8 do user → resposta com empresa    → bot finaliza
   *
   * IMPORTANTE: userMessages.length já inclui a mensagem atual (adicionada antes
   * de chamar sendMessage), então msg 1 = length 1.
   */
  private simulateResponse(chatHistory: ChatMessage[]): WolerzitoResponse {
    const userMessages = chatHistory.filter(m => m.role === 'user');
    const msgCount = userMessages.length; // 1-based: primeira msg do user = 1

    // Respostas do bot após cada mensagem do usuário
    const flow: Record<number, { message: string; currentStep: number }> = {
      1: {
        message: 'Entendo perfeitamente — esse é um dos desafios mais comuns que vemos nas empresas! Qual o setor de atuação da sua empresa?',
        currentStep: 2,
      },
      2: {
        message: 'Interessante! E qual o tamanho da equipe que precisa ser treinada? Pode ser um número aproximado mesmo.',
        currentStep: 3,
      },
      3: {
        message: 'Faz sentido. Vocês usam alguma plataforma ou ferramenta para treinamentos hoje, ou é mais por conta própria?',
        currentStep: 4,
      },
      4: {
        message: 'Entendi o cenário! E em quanto tempo vocês gostariam de ter uma solução rodando?',
        currentStep: 5,
      },
      5: {
        message: 'Ótimo! Para que um especialista da Woli possa entrar em contato já com contexto da sua situação, qual seu nome completo?',
        currentStep: 6,
      },
      6: {
        message: 'Prazer, {nome}! Qual seu melhor email ou WhatsApp para contato?',
        currentStep: 6,
      },
      7: {
        message: 'Anotado! E qual o nome da empresa?',
        currentStep: 6,
      },
    };

    if (msgCount <= 7) {
      const step = flow[msgCount] ?? flow[1];
      let message = step.message;

      // Personaliza a resposta do step 6 com o nome do usuário
      if (msgCount === 6) {
        const nome = userMessages[5]?.content?.split(' ')[0] ?? '';
        message = message.replace('{nome}', nome);
      }

      return { message, currentStep: step.currentStep, shouldEnd: false };
    }

    // Finalização — monta dados_lead com mapeamento direto por posição
    // [0]=desafio, [1]=setor, [2]=equipe, [3]=plataforma, [4]=urgência, [5]=nome, [6]=contato, [7]=empresa
    const r = (i: number) => userMessages[i]?.content;
    const contato = r(6) ?? '';
    const isEmail = contato.includes('@');

    const nome = r(5) ?? '';
    const empresa = r(7) ?? '';

    return {
      message: `Perfeito, ${nome.split(' ')[0]}! 🚀 Com o que você me contou, tenho certeza que nosso especialista vai conseguir te mostrar algo muito relevante para a ${empresa}. Ele já vai chegar sabendo do seu contexto. Em breve entraremos em contato!`,
      currentStep: 7,
      shouldEnd: true,
      finalData: {
        score: 70,
        classificacao: 'QUALIFICADO',
        status: 'FINALIZADO',
        resumo_conversa: `${nome}, da ${empresa} (setor: ${r(1)}, equipe: ${r(2)}). Desafio: ${r(0)}. Usa: ${r(3)}. Urgência: ${r(4)}.`,
        pitch: `A Woli pode ajudar a ${empresa} a resolver o desafio de ${r(0)?.toLowerCase()}. Com nossa plataforma gamificada, trilhas personalizadas e IA, seus colaboradores vão ter uma experiência de aprendizado que realmente engaja.\n\nAlém disso, nossos dashboards mostram em tempo real quem está engajado e quem precisa de reforço — visibilidade total para sua gestão.`,
        dados_lead: {
          nome: r(5),
          email: isEmail ? contato : undefined,
          whatsapp: !isEmail ? contato : undefined,
          empresa: r(7),
          setor: r(1),
          tamanho_equipe: r(2),
          desafio_principal: r(0),
          usa_plataforma: r(3),
          urgencia: r(4),
        },
      },
    };
  }

  isConfigured(): boolean {
    return Boolean(this.baseUrl && this.token);
  }
}

export const woliAIService = new WoliAIService();
