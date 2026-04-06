import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, LogOut, Download, Search, Filter, RefreshCw,
  TrendingUp, Bell, ChevronDown, BarChart2, X, Loader2,
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { leadsApi, LeadSummary, LeadsStats, LeadsFilters } from '../lib/api';
import { LeadDetailDrawer } from '../components/dashboard/LeadDetailDrawer';

// ─── Badge helpers ──────────────────────────────────────────────────────────

const CLASSIFICACAO_STYLES: Record<string, string> = {
  QUALIFICADO: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  DESCARTADO: 'bg-red-100 text-red-600 border border-red-200',
  INCOMPLETO: 'bg-amber-100 text-amber-700 border border-amber-200',
};

const CLASSIFICACAO_LABEL: Record<string, string> = {
  QUALIFICADO: '🟢 Quente',
  DESCARTADO: '🔴 Frio',
  INCOMPLETO: '🟡 Morno',
};

const STATUS_STYLES: Record<string, string> = {
  NOVO: 'bg-blue-100 text-blue-700',
  CONTATADO: 'bg-purple-100 text-purple-700',
  EM_NEGOCIACAO: 'bg-orange-100 text-orange-700',
  FECHADO: 'bg-emerald-100 text-emerald-700',
  PERDIDO: 'bg-gray-100 text-gray-500',
};

const STATUS_LABEL: Record<string, string> = {
  NOVO: 'Novo',
  CONTATADO: 'Contatado',
  EM_NEGOCIACAO: 'Em Negociação',
  FECHADO: 'Fechado',
  PERDIDO: 'Perdido',
};

function ClassificacaoBadge({ value }: { value: string }) {
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${CLASSIFICACAO_STYLES[value] ?? 'bg-gray-100 text-gray-500'}`}>
      {CLASSIFICACAO_LABEL[value] ?? value}
    </span>
  );
}

function StatusBadge({ value }: { value: string }) {
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[value] ?? 'bg-gray-100 text-gray-500'}`}>
      {STATUS_LABEL[value] ?? value}
    </span>
  );
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 70 ? 'bg-emerald-500' : score >= 45 ? 'bg-amber-400' : 'bg-red-400';
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-sm font-semibold text-woli-dark">{score}</span>
    </div>
  );
}

// ─── Stats cards ─────────────────────────────────────────────────────────────

function StatsCards({ stats }: { stats: LeadsStats | null }) {
  if (!stats) return null;
  const cards = [
    { label: 'Total de Leads', value: stats.total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Não Visualizados', value: stats.naoVisualizados, icon: Bell, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Qualificados', value: stats.qualificados, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Em Negociação', value: stats.porStatus['EM_NEGOCIACAO'] ?? 0, icon: BarChart2, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map(c => (
        <div key={c.label} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3 shadow-sm">
          <div className={`${c.bg} ${c.color} p-2.5 rounded-lg`}>
            <c.icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500">{c.label}</p>
            <p className="text-xl font-bold text-woli-dark">{c.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Filters bar ─────────────────────────────────────────────────────────────

function FiltersBar({
  filters,
  onChange,
  onClear,
}: {
  filters: LeadsFilters;
  onChange: (f: Partial<LeadsFilters>) => void;
  onClear: () => void;
}) {
  const hasActive = Object.values(filters).some(v => v && v !== '1');

  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      {/* Search */}
      <div className="relative flex-1 min-w-48">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar nome, empresa, email..."
          value={filters.search ?? ''}
          onChange={e => onChange({ search: e.target.value, page: 1 })}
          className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-woli-pink/30 focus:border-woli-pink"
        />
      </div>

      {/* Classificação */}
      <div className="relative">
        <select
          value={filters.classificacao ?? ''}
          onChange={e => onChange({ classificacao: e.target.value || undefined, page: 1 })}
          className="appearance-none pl-3 pr-8 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-woli-pink/30 focus:border-woli-pink bg-white"
        >
          <option value="">Classificação</option>
          <option value="QUALIFICADO">🟢 Quente</option>
          <option value="INCOMPLETO">🟡 Morno</option>
          <option value="DESCARTADO">🔴 Frio</option>
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>

      {/* Status comercial */}
      <div className="relative">
        <select
          value={filters.status_comercial ?? ''}
          onChange={e => onChange({ status_comercial: e.target.value || undefined, page: 1 })}
          className="appearance-none pl-3 pr-8 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-woli-pink/30 focus:border-woli-pink bg-white"
        >
          <option value="">Status</option>
          <option value="NOVO">Novo</option>
          <option value="CONTATADO">Contatado</option>
          <option value="EM_NEGOCIACAO">Em Negociação</option>
          <option value="FECHADO">Fechado</option>
          <option value="PERDIDO">Perdido</option>
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>

      {/* Datas */}
      <input
        type="date"
        value={filters.data_inicio ?? ''}
        onChange={e => onChange({ data_inicio: e.target.value || undefined, page: 1 })}
        className="px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-woli-pink/30 focus:border-woli-pink"
        title="Data início"
      />
      <input
        type="date"
        value={filters.data_fim ?? ''}
        onChange={e => onChange({ data_fim: e.target.value || undefined, page: 1 })}
        className="px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-woli-pink/30 focus:border-woli-pink"
        title="Data fim"
      />

      {hasActive && (
        <button
          onClick={onClear}
          className="flex items-center gap-1 px-3 py-2.5 text-sm text-gray-500 hover:text-red-500 transition"
        >
          <X className="w-4 h-4" /> Limpar
        </button>
      )}
    </div>
  );
}

// ─── Leads table ─────────────────────────────────────────────────────────────

function LeadsTable({
  leads,
  loading,
  onSelect,
}: {
  leads: LeadSummary[];
  loading: boolean;
  onSelect: (lead: LeadSummary) => void;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-woli-pink" />
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="font-medium">Nenhum lead encontrado</p>
        <p className="text-sm mt-1">Tente ajustar os filtros</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            {['Lead', 'Empresa', 'Score', 'Classificação', 'Status', 'Data', ''].map(h => (
              <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {leads.map(lead => (
            <tr
              key={lead.id}
              onClick={() => onSelect(lead)}
              className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors group"
            >
              <td className="py-3.5 px-4">
                <div className="flex items-center gap-3">
                  {!lead.primeiro_visualizado_em && (
                    <span className="w-2 h-2 rounded-full bg-woli-pink flex-shrink-0" title="Não visualizado" />
                  )}
                  <div>
                    <p className="font-medium text-woli-dark">{lead.nome ?? '—'}</p>
                    <p className="text-xs text-gray-400">{lead.email ?? lead.whatsapp ?? '—'}</p>
                  </div>
                </div>
              </td>
              <td className="py-3.5 px-4">
                <p className="text-woli-dark">{lead.empresa ?? '—'}</p>
                {lead.setor && <p className="text-xs text-gray-400">{lead.setor}</p>}
              </td>
              <td className="py-3.5 px-4">
                <ScoreBar score={lead.score} />
              </td>
              <td className="py-3.5 px-4">
                <ClassificacaoBadge value={lead.classificacao} />
              </td>
              <td className="py-3.5 px-4">
                <StatusBadge value={lead.status_comercial} />
              </td>
              <td className="py-3.5 px-4 text-gray-400 text-xs whitespace-nowrap">
                {new Date(lead.criado_em).toLocaleDateString('pt-BR')}
              </td>
              <td className="py-3.5 px-4">
                <span className="text-xs text-woli-pink opacity-0 group-hover:opacity-100 transition font-medium">
                  Ver detalhes →
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({
  page, pages, total, onChange,
}: { page: number; pages: number; total: number; onChange: (p: number) => void }) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
      <span className="text-sm text-gray-400">{total} leads</span>
      <div className="flex items-center gap-2">
        <button
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
        >
          Anterior
        </button>
        <span className="text-sm text-gray-600">{page} / {pages}</span>
        <button
          disabled={page >= pages}
          onClick={() => onChange(page + 1)}
          className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
        >
          Próxima
        </button>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const [leads, setLeads] = useState<LeadSummary[]>([]);
  const [stats, setStats] = useState<LeadsStats | null>(null);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<LeadsFilters>({ page: 1 });
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const loadLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await leadsApi.list(filters);
      setLeads(res.leads);
      setTotal(res.total);
      setPages(res.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadStats = useCallback(async () => {
    try {
      const s = await leadsApi.stats();
      setStats(s);
    } catch {}
  }, []);

  useEffect(() => { loadLeads(); }, [loadLeads]);
  useEffect(() => { loadStats(); }, [loadStats]);

  const handleFilterChange = (f: Partial<LeadsFilters>) => {
    setFilters(prev => ({ ...prev, ...f }));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDrawerClose = () => {
    setSelectedLeadId(null);
    loadLeads();
    loadStats();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-woli-dark flex-shrink-0 flex flex-col">
        <div className="p-5 border-b border-white/10">
          <span className="text-2xl font-bold text-woli-pink">woli</span>
          <p className="text-white/40 text-xs mt-0.5">Growth AI</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white bg-white/10 text-sm font-medium">
            <Users className="w-4 h-4" />
            Leads
            {(stats?.naoVisualizados ?? 0) > 0 && (
              <span className="ml-auto bg-woli-pink text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                {stats?.naoVisualizados}
              </span>
            )}
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/50 text-sm hover:text-white/80 transition">
            <BarChart2 className="w-4 h-4" />
            Relatórios
            <span className="ml-auto text-xs text-white/30">Em breve</span>
          </a>
        </nav>

        <div className="p-3 border-t border-white/10">
          <div className="px-3 py-2 mb-1">
            <p className="text-white/80 text-sm font-medium truncate">{user?.nome}</p>
            <p className="text-white/40 text-xs truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-white/50 hover:text-white/80 text-sm rounded-xl transition"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-lg font-bold text-woli-dark">Leads Qualificados</h1>
            <p className="text-sm text-gray-400">Gerencie o pipeline comercial</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { loadLeads(); loadStats(); }}
              className="p-2 text-gray-400 hover:text-woli-pink transition rounded-lg hover:bg-gray-50"
              title="Atualizar"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={leadsApi.exportCsv}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-200 rounded-xl hover:bg-gray-50 transition"
            >
              <Download className="w-4 h-4" />
              Exportar CSV
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <StatsCards stats={stats} />

          {/* Table card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-semibold text-woli-dark">Filtros</span>
              </div>
            </div>
            <div className="p-5">
              <FiltersBar
                filters={filters}
                onChange={handleFilterChange}
                onClear={() => setFilters({ page: 1 })}
              />
              <LeadsTable
                leads={leads}
                loading={loading}
                onSelect={lead => setSelectedLeadId(lead.id)}
              />
              <Pagination
                page={filters.page ?? 1}
                pages={pages}
                total={total}
                onChange={p => handleFilterChange({ page: p })}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Lead detail drawer */}
      {selectedLeadId && (
        <LeadDetailDrawer
          leadId={selectedLeadId}
          onClose={handleDrawerClose}
        />
      )}
    </div>
  );
}
