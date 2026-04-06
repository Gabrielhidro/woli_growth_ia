import { Router, Response } from 'express';
import { prisma } from '../utils/prisma';
import { authMiddleware, AuthRequest } from '../middlewares/auth.middleware';

const router = Router();

// Aplica auth em todas as rotas deste router
router.use(authMiddleware);

/**
 * GET /api/leads/stats
 * Contadores para o topo do dashboard (RF18)
 */
router.get('/api/leads/stats', async (_req: AuthRequest, res: Response) => {
  const [total, naoVisualizados, qualificados, porStatus] = await Promise.all([
    prisma.lead.count({ where: { status: 'FINALIZADO' } }),
    prisma.lead.count({ where: { status: 'FINALIZADO', primeiro_visualizado_em: null } }),
    prisma.lead.count({ where: { status: 'FINALIZADO', classificacao: 'QUALIFICADO' } }),
    prisma.lead.groupBy({
      by: ['status_comercial'],
      where: { status: 'FINALIZADO' },
      _count: true,
    }),
  ]);

  const statusMap: Record<string, number> = {};
  porStatus.forEach(s => { statusMap[s.status_comercial] = s._count; });

  res.json({ total, naoVisualizados, qualificados, porStatus: statusMap });
});

/**
 * GET /api/leads/export.csv
 * Exportação CSV (RF20)
 */
router.get('/api/leads/export.csv', async (_req: AuthRequest, res: Response) => {
  const leads = await prisma.lead.findMany({
    where: { status: 'FINALIZADO' },
    orderBy: [{ score: 'desc' }, { criado_em: 'desc' }],
  });

  const headers = [
    'ID', 'Nome', 'Email', 'WhatsApp', 'Empresa', 'Setor',
    'Tamanho Equipe', 'Score', 'Classificação', 'Status Comercial',
    'Desafio Principal', 'Usa Plataforma', 'Criado Em',
  ];

  const rows = leads.map(l => [
    l.id, l.nome ?? '', l.email ?? '', l.whatsapp ?? '',
    l.empresa ?? '', l.setor ?? '', l.tamanho_equipe ?? '',
    l.score, l.classificacao, l.status_comercial,
    (l.desafio_principal ?? '').replace(/,/g, ';'),
    l.usa_plataforma ?? '',
    new Date(l.criado_em).toLocaleString('pt-BR'),
  ]);

  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="leads-woli.csv"');
  res.send('\uFEFF' + csv); // BOM para Excel abrir UTF-8 corretamente
});

/**
 * GET /api/leads
 * Lista leads com filtros e ordenação (RF12, RF15, RN-09)
 */
router.get('/api/leads', async (req: AuthRequest, res: Response) => {
  const {
    classificacao,
    status_comercial,
    setor,
    data_inicio,
    data_fim,
    search,
    page = '1',
    limit = '20',
  } = req.query as Record<string, string>;

  const where: Record<string, unknown> = { status: 'FINALIZADO' };

  if (classificacao) where['classificacao'] = classificacao;
  if (status_comercial) where['status_comercial'] = status_comercial;
  if (setor) where['setor'] = { contains: setor };
  if (data_inicio || data_fim) {
    where['criado_em'] = {
      ...(data_inicio ? { gte: new Date(data_inicio) } : {}),
      ...(data_fim ? { lte: new Date(data_fim + 'T23:59:59') } : {}),
    };
  }
  if (search) {
    where['OR'] = [
      { nome: { contains: search } },
      { email: { contains: search } },
      { empresa: { contains: search } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: [{ score: 'desc' }, { criado_em: 'desc' }],
      skip,
      take: parseInt(limit),
      select: {
        id: true,
        nome: true,
        email: true,
        whatsapp: true,
        empresa: true,
        setor: true,
        tamanho_equipe: true,
        score: true,
        classificacao: true,
        status_comercial: true,
        primeiro_visualizado_em: true,
        criado_em: true,
      },
    }),
    prisma.lead.count({ where }),
  ]);

  res.json({
    leads,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
  });
});

/**
 * GET /api/leads/:id
 * Detalhe do lead + marca primeiro_visualizado_em (RF13, RF19)
 */
router.get('/api/leads/:id', async (req: AuthRequest, res: Response) => {
  const lead = await prisma.lead.findUnique({ where: { id: req.params.id } });

  if (!lead) return res.status(404).json({ error: 'Lead não encontrado' });

  // Registra primeiro acesso (RF19)
  if (!lead.primeiro_visualizado_em) {
    await prisma.lead.update({
      where: { id: lead.id },
      data: { primeiro_visualizado_em: new Date() },
    });
  }

  res.json({
    ...lead,
    historico_chat: JSON.parse(lead.historico_chat || '[]'),
    historico_status: JSON.parse(lead.historico_status || '[]'),
  });
});

/**
 * PATCH /api/leads/:id/status
 * Altera status comercial e registra histórico (RF14, RN-08)
 */
router.patch('/api/leads/:id/status', async (req: AuthRequest, res: Response) => {
  const { status } = req.body;

  const VALID_STATUSES = ['NOVO', 'CONTATADO', 'EM_NEGOCIACAO', 'FECHADO', 'PERDIDO'];
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `Status inválido. Use: ${VALID_STATUSES.join(', ')}` });
  }

  const lead = await prisma.lead.findUnique({ where: { id: req.params.id } });
  if (!lead) return res.status(404).json({ error: 'Lead não encontrado' });

  const historico = JSON.parse(lead.historico_status || '[]');
  historico.push({ status, timestamp: new Date().toISOString(), changed_by: req.userEmail });

  const updated = await prisma.lead.update({
    where: { id: req.params.id },
    data: {
      status_comercial: status,
      historico_status: JSON.stringify(historico),
    },
  });

  res.json({ status_comercial: updated.status_comercial, historico_status: historico });
});

/**
 * PATCH /api/leads/:id/anotacoes
 * Salva anotações internas (RF16)
 */
router.patch('/api/leads/:id/anotacoes', async (req: AuthRequest, res: Response) => {
  const { anotacoes } = req.body;

  if (typeof anotacoes !== 'string') {
    return res.status(400).json({ error: 'Campo anotacoes deve ser string' });
  }

  const updated = await prisma.lead.update({
    where: { id: req.params.id },
    data: { anotacoes_internas: anotacoes },
  });

  res.json({ anotacoes_internas: updated.anotacoes_internas });
});

export { router as leadsRoutes };
