/**
 * Indicador de "Wolerzito está digitando..."
 */

export function TypingIndicator() {
  return (
    <div className="flex justify-start animate-fade-in">
      <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-lg">🤖</span>
          <span className="text-xs font-semibold text-gray-600">
            Wolerzito
          </span>
        </div>
        <div className="flex items-center gap-1 mt-2">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
