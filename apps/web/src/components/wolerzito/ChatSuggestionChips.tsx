/**
 * Componente de chips de sugestão de resposta
 * Conforme documento "Sugestões de Respostas por Passo"
 */

import { useState } from 'react';

interface ChatSuggestionChipsProps {
  currentStep: number;
  onSelect: (text: string) => void;
}

export function ChatSuggestionChips({
  currentStep,
  onSelect,
}: ChatSuggestionChipsProps) {
  const [showAll, setShowAll] = useState(false);

  const suggestions = getSuggestionsForStep(currentStep);

  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  // Passo 1 e 2: mostrar 4 + "Ver mais"
  const shouldLimitDisplay = (currentStep === 1 || currentStep === 2) && suggestions.length > 4;
  const displayedSuggestions = shouldLimitDisplay && !showAll
    ? suggestions.slice(0, 4)
    : suggestions;

  return (
    <div className="flex flex-col gap-2 animate-fade-in">
      <p className="text-xs text-gray-500 px-1">Sugestões de resposta:</p>
      <div className="flex flex-wrap gap-2">
        {displayedSuggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSelect(suggestion)}
            className="px-4 py-2 bg-white border-2 border-pink-300 text-pink-700 rounded-full text-sm hover:bg-pink-50 hover:border-pink-400 transition-all focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
          >
            {suggestion}
          </button>
        ))}

        {shouldLimitDisplay && !showAll && (
          <button
            onClick={() => setShowAll(true)}
            className="px-4 py-2 bg-gradient-to-r from-pink-100 to-purple-100 border-2 border-pink-300 text-pink-700 rounded-full text-sm hover:from-pink-200 hover:to-purple-200 transition-all focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 font-semibold"
          >
            Ver mais +{suggestions.length - 4}
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Retorna as sugestões apropriadas para cada passo
 */
function getSuggestionsForStep(step: number): string[] {
  switch (step) {
    case 1: // Desafio principal
      return [
        'Baixo engajamento nos treinamentos',
        'Dificuldade em escalar treinamentos',
        'Falta de organização dos conteúdos',
        'Treinamentos muito genéricos',
        'Dificuldade em medir resultados',
        'Onboarding demorado e manual',
        'Compliance e certificações',
        'Equipe remota/híbrida dificulta treinar',
      ];

    case 2: // Setor
      return [
        'Tecnologia',
        'Varejo',
        'Serviços',
        'Saúde',
        'Educação',
        'Financeiro',
        'Indústria',
        'Logística',
        'Construção',
        'Consultoria',
      ];

    case 3: // Tamanho da equipe
      return [
        '1-10 pessoas',
        '11-50 pessoas',
        '51-200 pessoas',
        '200+ pessoas',
      ];

    case 4: // Plataforma atual
      return [
        'Google Drive / OneDrive',
        'Não usamos nada estruturado',
        'LMS tradicional (Moodle, etc)',
        'Ferramentas diversas sem integração',
      ];

    case 5: // Urgência
      return [
        'Precisamos começar o quanto antes',
        'Nos próximos 1-3 meses',
        'Próximos 3-6 meses',
        'Apenas explorando opções',
      ];

    case 6: // Contato - SEM chips, apenas campo de texto
      return [];

    default:
      return [];
  }
}
