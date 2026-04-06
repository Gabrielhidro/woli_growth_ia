/**
 * Store global do chat usando Zustand
 */

import { create } from 'zustand';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatState {
  sessionId: string | null;
  leadId: string | null;
  messages: ChatMessage[];
  currentStep: number;
  isLoading: boolean;
  isOpen: boolean;
  hasEnded: boolean;
  error: string | null;

  // Actions
  startChat: () => Promise<void>;
  sendMessage: (message: string) => Promise<void>;
  toggleChat: () => void;
  restartChat: () => void;
  setError: (error: string | null) => void;
}

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3333').replace(/\/+$/, '');

export const useChatStore = create<ChatState>((set, get) => ({
  sessionId: null,
  leadId: null,
  messages: [],
  currentStep: 0,
  isLoading: false,
  isOpen: false,
  hasEnded: false,
  error: null,

  startChat: async () => {
    try {
      set({ isLoading: true, error: null });

      const response = await fetch(`${API_URL}/api/chat/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Erro ao iniciar chat');
      }

      const data = await response.json();

      set({
        sessionId: data.sessionId,
        leadId: data.leadId,
        messages: [
          {
            id: Date.now().toString(),
            role: 'assistant',
            content: data.message,
            timestamp: new Date(),
          },
        ],
        currentStep: data.currentStep || 1,
        isLoading: false,
      });
    } catch (error) {
      console.error('Erro ao iniciar chat:', error);
      set({
        error: 'Não foi possível iniciar o chat. Tente novamente.',
        isLoading: false,
      });
    }
  },

  sendMessage: async (message: string) => {
    const { sessionId, messages } = get();

    if (!sessionId) {
      console.error('Sessão não iniciada');
      return;
    }

    // Adiciona mensagem do usuário imediatamente
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    set({
      messages: [...messages, userMessage],
      isLoading: true,
      error: null,
    });

    try {
      const response = await fetch(`${API_URL}/api/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message }),
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar mensagem');
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      };

      set(state => ({
        messages: [...state.messages, assistantMessage],
        currentStep: data.currentStep || state.currentStep,
        isLoading: false,
        hasEnded: data.shouldEnd || false,
      }));
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      set({
        error: 'Erro ao enviar mensagem. Tente novamente.',
        isLoading: false,
      });
    }
  },

  toggleChat: () => {
    set(state => ({ isOpen: !state.isOpen }));
  },

  restartChat: () => {
    set({
      sessionId: null,
      leadId: null,
      messages: [],
      currentStep: 0,
      isLoading: false,
      hasEnded: false,
      error: null,
    });

    // Inicia um novo chat
    setTimeout(() => {
      get().startChat();
    }, 100);
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));
