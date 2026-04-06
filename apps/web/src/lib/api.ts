const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3333').replace(/\/+$/, '');

function getToken(): string | null {
  return localStorage.getItem('woli_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    localStorage.removeItem('woli_token');
    localStorage.removeItem('woli_user');
    window.location.href = '/login';
    throw new Error('Não autorizado');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erro na requisição');
  }

  return res.json();
}

// Auth
export const authApi = {
  login: (email: string, senha: string) =>
    request<{ token: string; user: { id: string; email: string; nome: string } }>(
      '/api/auth/login',
      { method: 'POST', body: JSON.stringify({ email, senha }) }
    ),
};

// Leads
export interface LeadSummary {
  id: string;
  nome: string | null;
  email: string | null;
  whatsapp: string | null;
  empresa: string | null;
  setor: string | null;
  tamanho_equipe: string | null;
  score: number;
  classificacao: string;
  status_comercial: string;
  primeiro_visualizado_em: string | null;
  criado_em: string;
}

export interface LeadDetail extends LeadSummary {
  desafio_principal: string | null;
  usa_plataforma: string | null;
  resumo_conversa: string | null;
  pitch: string | null;
  anotacoes_internas: string | null;
  historico_chat: Array<{ role: string; content: string; timestamp: string }>;
  historico_status: Array<{ status: string; timestamp: string; changed_by?: string }>;
}

export interface LeadsResponse {
  leads: LeadSummary[];
  total: number;
  page: number;
  pages: number;
}

export interface LeadsStats {
  total: number;
  naoVisualizados: number;
  qualificados: number;
  porStatus: Record<string, number>;
}

export interface LeadsFilters {
  classificacao?: string;
  status_comercial?: string;
  setor?: string;
  data_inicio?: string;
  data_fim?: string;
  search?: string;
  page?: number;
}

export const leadsApi = {
  list: (filters: LeadsFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, String(v)); });
    return request<LeadsResponse>(`/api/leads?${params}`);
  },

  get: (id: string) => request<LeadDetail>(`/api/leads/${id}`),

  stats: () => request<LeadsStats>('/api/leads/stats'),

  updateStatus: (id: string, status: string) =>
    request<{ status_comercial: string }>(`/api/leads/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  updateNotes: (id: string, anotacoes: string) =>
    request<{ anotacoes_internas: string }>(`/api/leads/${id}/anotacoes`, {
      method: 'PATCH',
      body: JSON.stringify({ anotacoes }),
    }),

  exportCsv: () => {
    const token = getToken();
    fetch(`${API_BASE}/api/leads/export.csv`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(async (res) => {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'leads-woli.csv';
      a.click();
      URL.revokeObjectURL(url);
    });
  },
};
