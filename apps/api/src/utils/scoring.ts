/**
 * Sistema de Scoring do Wolerzito
 * Calcula o score de qualificação do lead baseado em 4 dimensões (RN-03)
 */

export interface ScoringInput {
  tamanho_equipe?: string;
  urgencia?: string;
  desafio_principal?: string;
  usa_plataforma?: string;
  setor?: string;
}

export interface ScoringResult {
  score: number;
  breakdown: {
    tamanho: number;
    urgencia: number;
    fit: number;
    maturidade: number;
  };
}

/**
 * Calcula o score de um lead baseado nas 4 dimensões:
 * 1. Tamanho da equipe (0-25 pontos)
 * 2. Urgência (0-25 pontos)
 * 3. Fit com Woli (0-30 pontos)
 * 4. Maturidade Digital (0-20 pontos)
 */
export function calculateScore(input: ScoringInput): ScoringResult {
  const breakdown = {
    tamanho: calculateTamanhoScore(input.tamanho_equipe),
    urgencia: calculateUrgenciaScore(input.urgencia),
    fit: calculateFitScore(input.desafio_principal),
    maturidade: calculateMaturidadeScore(input.usa_plataforma),
  };

  const score = breakdown.tamanho + breakdown.urgencia + breakdown.fit + breakdown.maturidade;

  return {
    score: Math.min(100, Math.max(0, score)),
    breakdown,
  };
}

/**
 * Dimensão 1: Tamanho da Equipe (0-25 pontos)
 */
function calculateTamanhoScore(tamanho?: string): number {
  if (!tamanho) return 0;

  const tamanhoLower = tamanho.toLowerCase();

  // 200+ pessoas: 25 pontos
  if (
    tamanhoLower.includes('200+') ||
    tamanhoLower.includes('mais de 200') ||
    tamanhoLower.includes('acima de 200') ||
    tamanhoLower.includes('500') ||
    tamanhoLower.includes('1000') ||
    tamanhoLower.includes('mil')
  ) {
    return 25;
  }

  // 51-200 pessoas: 20 pontos
  if (
    tamanhoLower.includes('51-200') ||
    tamanhoLower.includes('50-200') ||
    tamanhoLower.includes('100') ||
    tamanhoLower.includes('150') ||
    (tamanhoLower.includes('50') && tamanhoLower.includes('200'))
  ) {
    return 20;
  }

  // 11-50 pessoas: 15 pontos
  if (
    tamanhoLower.includes('11-50') ||
    tamanhoLower.includes('10-50') ||
    tamanhoLower.includes('20') ||
    tamanhoLower.includes('30') ||
    tamanhoLower.includes('40') ||
    tamanhoLower.includes('50')
  ) {
    return 15;
  }

  // 1-10 pessoas: 5 pontos
  if (
    tamanhoLower.includes('1-10') ||
    tamanhoLower.includes('pequena') ||
    tamanhoLower.includes('startup') ||
    tamanhoLower.match(/\b[1-9]\b/)
  ) {
    return 5;
  }

  return 10; // Padrão se mencionou algum tamanho mas não conseguimos categorizar
}

/**
 * Dimensão 2: Urgência (0-25 pontos)
 */
function calculateUrgenciaScore(urgencia?: string): number {
  if (!urgencia) return 0;

  const urgenciaLower = urgencia.toLowerCase();

  // Urgente/Imediato: 25 pontos
  if (
    urgenciaLower.includes('urgente') ||
    urgenciaLower.includes('imediato') ||
    urgenciaLower.includes('agora') ||
    urgenciaLower.includes('já') ||
    urgenciaLower.includes('ontem') ||
    urgenciaLower.includes('o quanto antes')
  ) {
    return 25;
  }

  // 1-3 meses: 20 pontos
  if (
    urgenciaLower.includes('1-3 mes') ||
    urgenciaLower.includes('próximo mês') ||
    urgenciaLower.includes('próximos meses') ||
    urgenciaLower.includes('breve') ||
    urgenciaLower.includes('em breve')
  ) {
    return 20;
  }

  // 3-6 meses: 15 pontos
  if (
    urgenciaLower.includes('3-6 mes') ||
    urgenciaLower.includes('semestre') ||
    urgenciaLower.includes('segundo semestre') ||
    urgenciaLower.includes('trimestre')
  ) {
    return 15;
  }

  // Apenas explorando: 5 pontos
  if (
    urgenciaLower.includes('explor') ||
    urgenciaLower.includes('pesquis') ||
    urgenciaLower.includes('futur') ||
    urgenciaLower.includes('ainda não') ||
    urgenciaLower.includes('sem pressa')
  ) {
    return 5;
  }

  return 10; // Padrão
}

/**
 * Dimensão 3: Fit com Woli (0-30 pontos)
 */
function calculateFitScore(desafio?: string): number {
  if (!desafio) return 0;

  const desafioLower = desafio.toLowerCase();

  // Palavras-chave de alto fit (30 pontos)
  const highFitKeywords = [
    'engajamento',
    'engajar',
    'gamificação',
    'gamificar',
    'vídeo',
    'videos',
    'interativo',
    'moderna',
    'experiência',
    'motivar',
    'desorganizado',
    'escala',
    'escalar',
    'disperso',
    'fragmentado',
  ];

  const hasHighFit = highFitKeywords.some(keyword => desafioLower.includes(keyword));
  if (hasHighFit) return 30;

  // Palavras-chave de médio fit (20 pontos)
  const mediumFitKeywords = [
    'treinamento',
    'capacitação',
    'aprendizado',
    'desenvolvimento',
    'onboarding',
    'integração',
    'compliance',
    'reciclagem',
    'atualização',
  ];

  const hasMediumFit = mediumFitKeywords.some(keyword => desafioLower.includes(keyword));
  if (hasMediumFit) return 20;

  // Baixo fit (10 pontos)
  return 10;
}

/**
 * Dimensão 4: Maturidade Digital (0-20 pontos)
 */
function calculateMaturidadeScore(plataforma?: string): number {
  if (!plataforma) return 0;

  const plataformaLower = plataforma.toLowerCase();

  // Já usa plataforma LMS/LXP: 20 pontos
  if (
    plataformaLower.includes('lms') ||
    plataformaLower.includes('lxp') ||
    plataformaLower.includes('moodle') ||
    plataformaLower.includes('canvas') ||
    plataformaLower.includes('blackboard') ||
    plataformaLower.includes('totara') ||
    plataformaLower.includes('plataforma')
  ) {
    return 20;
  }

  // Usa ferramentas diversas: 15 pontos
  if (
    plataformaLower.includes('google') ||
    plataformaLower.includes('drive') ||
    plataformaLower.includes('teams') ||
    plataformaLower.includes('slack') ||
    plataformaLower.includes('zoom') ||
    plataformaLower.includes('youtube') ||
    plataformaLower.includes('ferramentas')
  ) {
    return 15;
  }

  // Manual (slides, email): 10 pontos
  if (
    plataformaLower.includes('manual') ||
    plataformaLower.includes('slide') ||
    plataformaLower.includes('powerpoint') ||
    plataformaLower.includes('email') ||
    plataformaLower.includes('e-mail') ||
    plataformaLower.includes('pdf')
  ) {
    return 10;
  }

  // Não tem nada estruturado: 5 pontos
  if (
    plataformaLower.includes('não') ||
    plataformaLower.includes('nada') ||
    plataformaLower.includes('nenhum') ||
    plataformaLower.includes('sem estrutura')
  ) {
    return 5;
  }

  return 10; // Padrão
}

/**
 * Determina a classificação do lead baseado no score e dados coletados
 */
export function determineClassificacao(
  score: number,
  hasContact: boolean,
  hasBusinessContext: boolean
): 'QUALIFICADO' | 'DESCARTADO' | 'INCOMPLETO' {
  // QUALIFICADO: tem contato completo + contexto + score >= 60
  if (hasContact && hasBusinessContext && score >= 60) {
    return 'QUALIFICADO';
  }

  // DESCARTADO: score muito baixo (< 40) mesmo com dados
  if (score < 40 && hasBusinessContext) {
    return 'DESCARTADO';
  }

  // INCOMPLETO: todos os outros casos
  return 'INCOMPLETO';
}
