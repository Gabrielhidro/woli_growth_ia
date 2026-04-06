/**
 * Componente principal do Chat Qualificador (Wolerzito)
 */

import { useState, useEffect, useRef } from 'react';
import { useChatStore } from '../../stores/chatStore';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ChatSuggestionChips } from './ChatSuggestionChips';
import { TypingIndicator } from './TypingIndicator';
import { ChatHeader } from './ChatHeader';

export function WolerzitoChat() {
  const {
    messages,
    currentStep,
    isLoading,
    isOpen,
    hasEnded,
    startChat,
    sendMessage,
    toggleChat,
    restartChat,
  } = useChatStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);

  // Inicia o chat automaticamente quando abre (RF02)
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      startChat();
    }
  }, [isOpen, messages.length, startChat]);

  // Auto-scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (text: string) => {
    setShowSuggestions(false);
    await sendMessage(text);
    // Mostra sugestões novamente após a resposta (se não for passo 6)
    if (currentStep !== 6) {
      setTimeout(() => setShowSuggestions(true), 1000);
    }
  };

  const handleChipSelect = (text: string) => {
    setShowSuggestions(false);
    sendMessage(text);
  };

  if (!isOpen) {
    return (
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center text-white text-2xl z-50"
        aria-label="Abrir chat"
      >
        💬
      </button>
    );
  }

  return (
    <div className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 w-full sm:max-w-md h-full sm:h-[600px] bg-white sm:rounded-2xl shadow-2xl flex flex-col z-50 animate-fade-in">
      <ChatHeader onClose={toggleChat} onRestart={restartChat} />

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
        {messages.map((message, index) => (
          <ChatMessage
            key={message.id || index}
            message={message}
            isUser={message.role === 'user'}
          />
        ))}

        {isLoading && <TypingIndicator />}

        {/* Sugestões de resposta (chips) */}
        {!isLoading &&
          !hasEnded &&
          showSuggestions &&
          currentStep > 0 &&
          currentStep !== 6 &&
          messages.length > 0 && (
            <ChatSuggestionChips
              currentStep={currentStep}
              onSelect={handleChipSelect}
            />
          )}

        <div ref={messagesEndRef} />
      </div>

      {hasEnded ? (
        <div className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 border-t border-gray-200">
          <p className="text-sm text-center text-gray-700 mb-3">
            Perfeito! Em breve um especialista da Woli entrará em contato. 🎉
          </p>
          <button
            onClick={restartChat}
            className="w-full py-2 px-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all"
          >
            Iniciar nova conversa
          </button>
        </div>
      ) : (
        <ChatInput onSend={handleSendMessage} disabled={isLoading} />
      )}
    </div>
  );
}
