/**
 * Componente de mensagem individual do chat
 */

interface ChatMessageProps {
  message: {
    content: string;
    timestamp: Date;
  };
  isUser: boolean;
}

export function ChatMessage({ message, isUser }: ChatMessageProps) {
  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
    >
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
            : 'bg-gray-100 text-gray-800'
        }`}
      >
        {!isUser && (
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🤖</span>
            <span className="text-xs font-semibold text-gray-600">
              Wolerzito
            </span>
          </div>
        )}
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>
      </div>
    </div>
  );
}
