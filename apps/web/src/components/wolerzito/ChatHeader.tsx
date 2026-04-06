/**
 * Cabeçalho do chat
 */

import { X, RotateCcw } from 'lucide-react';

interface ChatHeaderProps {
  onClose: () => void;
  onRestart: () => void;
}

export function ChatHeader({ onClose, onRestart }: ChatHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🤖</span>
        <div>
          <h3 className="font-semibold">Wolerzito</h3>
          <p className="text-xs text-pink-100">Assistente da Woli</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onRestart}
          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          title="Reiniciar conversa"
          aria-label="Reiniciar conversa"
        >
          <RotateCcw size={18} />
        </button>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          aria-label="Fechar chat"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
