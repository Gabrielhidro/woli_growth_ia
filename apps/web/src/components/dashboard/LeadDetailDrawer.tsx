import { useEffect, useState, useRef, useCallback } from 'react';
import {
  X, Copy, Check, ChevronDown, Building2, Mail, Phone,
  MessageSquare, FileText, StickyNote, Clock, Loader2,
} from 'lucide-react';
import { leadsApi, LeadDetail } from '../../lib/api';

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUSES = [
  { value: 'NOVO', label: 'Novo', color: 'text-blue-700 bg-blue-50 border-blue-200' },
  { value: 'CONTATADO', label: 'Contatado', color: 'text-purple-700 bg-purple-50 border-purple-200' },
  { value: 'EM_NEGOCIACAO', label: 'Em Negociação', color: 'text-orange-700 bg-orange-50 border-orange-200' },
  { value: 'FECHADO', label: 'Fechado ✓', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  { value: 'PERDIDO', label: 'Perdido', color: 'text-gray-500 bg-gray-50 border-gray-200' },
];

const SCORE_COLOR = (s: number) =>
  s >= 70 ? 'text-emerald-600 bg-emerald-50' : s >= 45 ? 'text-amber-600 bg-amber-50' : 'text-red-600 bg-red-50';

const CLASSIF_COLOR: Record<string, string> = {
  QUALIFICADO: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  DESCARTADO: 'text-red-600 bg-red-50 border-red-200',
  INCOMPLETO: 'text-amber-700 bg-amber-50 border-amber-200',
};
const CLASSIF_LABEL: Record<string, string> = {
  QUALIFICADO: '🟢 Quente', DESCARTADO: '🔴 Frio', INCOMPLETO: '🟡 Morno',
};

// ─── Section wrapper ─────────────────────────────────────────────────────────

function Section({ title, icon: Icon, children }: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
        <Icon className="w-4 h-4 text-gray-400" />
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

// ─── Copy button ─────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-woli-pink/30 text-woli-pink hover:bg-woli-pink hover:text-white transition"
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copiado!' : 'Copiar pitch'}
    </button>
  );
}

// ─── Status selector ─────────────────────────────────────────────────────────

function StatusSelector({ leadId, current, onChanged }: {
  leadId: string;
  current: string;
  onChanged: (newStatus: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const current_style = STATUSES.find(s => s.value === current);

  const select = async (value: string) => {
    setOpen(false);
    if (value === current) return;
    setSaving(true);
    try {
      await leadsApi.updateStatus(leadId, value);
      onChanged(value);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        disabled={saving}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition ${current_style?.color ?? 'bg-gray-50 border-gray-200 text-gray-600'}`}
      >
        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
        {current_style?.label ?? current}
        <ChevronDown className="w-3.5 h-3.5" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 w-44 bg-white border border-gray-100 rounded-xl shadow-lg z-10 py-1">
          {STATUSES.map(s => (
            <button
              key={s.value}
              onClick={() => select(s.value)}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition ${s.value === current ? 'font-semibold' : ''}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Notes field ─────────────────────────────────────────────────────────────

function NotesField({ leadId, initial }: { leadId: string; initial: string | null }) {
  const [value, setValue] = useState(initial ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const save = useCallback(async (text: string) => {
    setSaving(true);
    try {
      await leadsApi.updateNotes(leadId, text);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }, [leadId]);

  const handleChange = (v: string) => {
    setValue(v);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => save(v), 1200);
  };

  return (
    <div>
      <textarea
        value={value}
        onChange={e => handleChange(e.target.value)}
        rows={4}
        placeholder="Adicione anotações internas sobre este lead..."
        className="w-full text-sm px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-woli-pink/30 focus:border-woli-pink resize-none transition"
      />
      <p className="text-xs text-gray-400 mt-1 text-right">
        {saving ? 'Salvando...' : saved ? '✓ Salvo' : 'Auto-save'}
      </p>
    </div>
  );
}

// ─── Chat history ─────────────────────────────────────────────────────────────

function ChatHistory({ messages }: {
  messages: Array<{ role: string; content: string; timestamp: string }>;
}) {
  if (messages.length === 0) {
    return <p className="text-sm text-gray-400 italic">Histórico não disponível</p>;
  }
  return (
    <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
      {messages.filter(m => m.role !== 'system').map((m, i) => (
        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm ${
            m.role === 'user'
              ? 'bg-woli-pink text-white rounded-tr-sm'
              : 'bg-gray-100 text-gray-700 rounded-tl-sm'
          }`}>
            {m.content}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main drawer ─────────────────────────────────────────────────────────────

export function LeadDetailDrawer({ leadId, onClose }: {
  leadId: string;
  onClose: () => void;
}) {
  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    leadsApi.get(leadId).then(data => {
      setLead(data);
      setLoading(false);
    });
  }, [leadId]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          {loading ? (
            <div className="h-6 w-48 bg-gray-100 animate-pulse rounded" />
          ) : (
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-lg font-bold text-woli-dark">{lead?.nome ?? 'Lead sem nome'}</h2>
                <p className="text-sm text-gray-400">{lead?.empresa ?? '—'}</p>
              </div>
              {lead && (
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${CLASSIF_COLOR[lead.classificacao]}`}>
                  {CLASSIF_LABEL[lead.classificacao] ?? lead.classificacao}
                </span>
              )}
            </div>
          )}
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-woli-pink" />
          </div>
        ) : lead ? (
          <div className="flex-1 overflow-y-auto p-6 space-y-5">

            {/* Score + Status */}
            <div className="flex flex-wrap items-center gap-3">
              <div className={`px-4 py-2 rounded-xl text-sm font-bold ${SCORE_COLOR(lead.score)}`}>
                Score: {lead.score}/100
              </div>
              <StatusSelector
                leadId={lead.id}
                current={lead.status_comercial}
                onChanged={s => setLead(prev => prev ? { ...prev, status_comercial: s } : prev)}
              />
              <span className="text-xs text-gray-400">
                Criado em {new Date(lead.criado_em).toLocaleDateString('pt-BR')}
              </span>
            </div>

            {/* Contato */}
            <Section title="Contato" icon={Building2}>
              <div className="grid grid-cols-2 gap-y-2 gap-x-6 text-sm">
                <Row label="Empresa" value={lead.empresa} />
                <Row label="Setor" value={lead.setor} />
                <Row label="Equipe" value={lead.tamanho_equipe} />
                <Row label="Plataforma atual" value={lead.usa_plataforma} />
                <div className="col-span-2 flex flex-wrap gap-3 mt-1">
                  {lead.email && (
                    <a href={`mailto:${lead.email}`} className="flex items-center gap-1.5 text-woli-pink hover:underline">
                      <Mail className="w-3.5 h-3.5" /> {lead.email}
                    </a>
                  )}
                  {lead.whatsapp && (
                    <a
                      href={`https://wa.me/55${lead.whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-emerald-600 hover:underline"
                    >
                      <Phone className="w-3.5 h-3.5" /> {lead.whatsapp}
                    </a>
                  )}
                </div>
              </div>
            </Section>

            {/* Resumo */}
            {lead.resumo_conversa && (
              <Section title="Resumo da Conversa" icon={FileText}>
                <p className="text-sm text-gray-700 leading-relaxed">{lead.resumo_conversa}</p>
              </Section>
            )}

            {/* Pitch */}
            {lead.pitch && (
              <Section title="Pitch Sugerido" icon={MessageSquare}>
                <div className="flex justify-end mb-3">
                  <CopyButton text={lead.pitch} />
                </div>
                {lead.pitch.split('\n\n').map((p, i) => (
                  <p key={i} className="text-sm text-gray-700 leading-relaxed mb-3">{p}</p>
                ))}
              </Section>
            )}

            {/* Histórico de chat */}
            <Section title="Conversa com o Wolerzito" icon={MessageSquare}>
              <ChatHistory messages={lead.historico_chat} />
            </Section>

            {/* Histórico de status */}
            {lead.historico_status.length > 0 && (
              <Section title="Histórico de Status" icon={Clock}>
                <div className="space-y-2">
                  {[...lead.historico_status].reverse().map((h, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <span className="w-2 h-2 rounded-full bg-woli-pink flex-shrink-0" />
                      <span className="font-medium text-gray-700">
                        {h.status.replace('_', ' ')}
                      </span>
                      <span className="text-gray-400">
                        {new Date(h.timestamp).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Anotações */}
            <Section title="Anotações Internas" icon={StickyNote}>
              <NotesField leadId={lead.id} initial={lead.anotacoes_internas} />
            </Section>

          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Lead não encontrado
          </div>
        )}
      </aside>
    </>
  );
}

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div>
      <span className="text-gray-400">{label}: </span>
      <span className="text-gray-700 font-medium">{value}</span>
    </div>
  );
}
