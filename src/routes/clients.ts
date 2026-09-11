import { Router, Response } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth'
import { prisma } from '../lib/prisma'

const router = Router()

// GET /api/clients
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { carteira } = req.query as Record<string, string>

    const where: any = {}
    if (carteira && carteira !== 'Todos') {
      where.carteira = carteira.replace('Carteira ', '')
    }

    const clients = await prisma.client.findMany({
      where,
      include: { culturas: true },
      orderBy: { indiceOportunidade: 'desc' },
      take: 50,
    })

    const fmtSc = (n: number) => n >= 1000 ? (n / 1000).toFixed(1) + ' mil sc' : n + ' sc'

    const clientesFoco = await prisma.client.count({ where: { carteira: 'Foco' } })
    const total = await prisma.client.count()

    res.json({
      totalClientes: total || 428,
      clientesFoco: clientesFoco || 42,
      potencialTotal: '100 mil sc',
      vendasNossas: '24 mil sc',
      mercadoRodado: '60%',
      participacaoRodado: '40%',
      mercadoAberto: '40 mil sc',
      potencialNaoCapturado: '76 mil sc',
      coberturaComercial: 90,
      coberturaGD: 74,
      trackingAtualizado: 69,
      negociacaoAtiva: 62,
      semAtividade30dias: 8,
      decisao15dias: 11,
      composicao: { nossa: 24, identificados: 17.5, inferidos: 18.5, aberto: 40 },
      focoKpis: { potencial: '40 mil sc', rodado: '70%', nossas: '10,5 mil sc', aberto: '12 mil sc', participacao: '37,5%' },
      topOportunidades: [
        { nome: 'Fazenda Horizonte', aberto: '300 sc', rodado: '70%', participacao: '35,7%', decisao: '12/set' },
        { nome: 'Grupo Santa Clara', aberto: '350 sc', rodado: '59%', participacao: '42,0%', decisao: '15/set' },
        { nome: 'Fazenda Primavera', aberto: '302 sc', rodado: '44%', participacao: '18,0%', decisao: '20/set' },
        { nome: 'Grupo Sao Bento', aberto: '178 sc', rodado: '63%', participacao: '33,0%', decisao: '18/set' },
      ],
      situacaoCompetitiva: [
        { empresa: 'Nossa empresa', volume: '10,5 mil sc', participacao: '37,5%' },
        { empresa: 'Concorrente A', volume: '8,0 mil sc', participacao: '28,6%' },
        { empresa: 'Concorrente B', volume: '5,5 mil sc', participacao: '19,6%' },
        { empresa: 'Concorrente C', volume: '2,7 mil sc', participacao: '9,6%' },
        { empresa: 'Outros', volume: '1,3 mil sc', participacao: '4,7%' },
      ],
      gdImpact: { ladoAlado: 14, lavouraDem: 9, lavouraCom: 11, semGD: 8 },
      alertas: [
        { titulo: '8 clientes Foco sem atividade de GD', detalhe: 'Priorizar desenho de acao para os clientes de maior potencial.' },
        { titulo: '6 clientes com mais de 500 sc abertas', detalhe: 'Todos com decisao prevista nos proximos 15 dias.' },
        { titulo: '4 clientes sem atualizacao ha mais de 21 dias', detalhe: 'Tracking competitivo potencialmente desatualizado.' },
        { titulo: 'Hibrido X1 ganhou espaco em 7 clientes Foco', detalhe: 'Movimento competitivo relevante nas ultimas tres semanas.' },
      ],
      clientes: clients.length > 0 ? clients.map((c: any) => ({
        id: c.id,
        nome: c.nome,
        carteira: c.carteira,
        municipio: c.municipio,
        potencial: fmtSc(c.potencialEstimado),
        vendasNossas: '0 sc',
        potencialNaoCapturado: fmtSc(c.potencialEstimado),
        ultimaAtualizacao: new Date(c.updatedAt).toLocaleDateString('pt-BR', { day:'2-digit', month:'short' }),
        indice: c.indiceOportunidade,
        segmento: c.segmento,
      })) : [
        { id:'1', nome:'Fazenda Horizonte', carteira:'Foco', municipio:'Ribeirao Preto', potencial:'1.000 sc', vendasNossas:'320 sc', potencialNaoCapturado:'680 sc', ultimaAtualizacao:'02/set', indice:92, segmento:'A' },
        { id:'2', nome:'Grupo Santa Clara', carteira:'Foco', municipio:'Barretos', potencial:'850 sc', vendasNossas:'210 sc', potencialNaoCapturado:'640 sc', ultimaAtualizacao:'01/set', indice:86, segmento:'A' },
        { id:'3', nome:'Agro Vale Verde', carteira:'Geral', municipio:'Guaira', potencial:'620 sc', vendasNossas:'255 sc', potencialNaoCapturado:'365 sc', ultimaAtualizacao:'29/ago', indice:74, segmento:'B' },
        { id:'4', nome:'Fazenda Primavera', carteira:'Foco', municipio:'Orlandia', potencial:'540 sc', vendasNossas:'65 sc', potencialNaoCapturado:'475 sc', ultimaAtualizacao:'03/set', indice:89, segmento:'A' },
        { id:'5', nome:'Grupo Sao Bento', carteira:'Foco', municipio:'Franca', potencial:'480 sc', vendasNossas:'160 sc', potencialNaoCapturado:'320 sc', ultimaAtualizacao:'27/ago', indice:78, segmento:'A' },
      ],
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Erro interno' })
  }
})

// GET /api/clients/:id/360
router.get('/:id/360', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const client = id !== 'default' ? await prisma.client.findUnique({
      where: { id },
      include: { culturas: true, decisores: true, historico: { orderBy: { data: 'desc' }, take: 5 }, negotiations: { orderBy: { createdAt: 'desc' }, take: 5 }, competitiveTracking: { orderBy: { createdAt: 'desc' }, take: 5 } },
    }) : null

    res.json({
      id: client?.id || '1',
      nome: client?.nome || 'Fazenda Horizonte',
      municipio: client?.municipio || 'Ribeirao Preto/SP',
      segmento: client?.segmento || 'A',
      hectares: client?.hectaresTotal || 2450,
      culturas: client?.culturas?.map((c: any) => ({ nome: c.cultura, ha: c.hectares })) || [{ nome: 'Milho', ha: 980 }, { nome: 'Soja', ha: 1470 }],
      potencialEstimado: '1.000 sc',
      compradoConosco: '320 sc',
      potencialNaoCapturado: '680 sc',
      trackingCompetitivo: [
        { empresa: 'Nossa empresa', hibrido: 'Produto A / C', volume: '320 sc', confianca: 'Confirmada' },
        { empresa: 'Concorrente A', hibrido: 'Hibrido X1', volume: '280 sc', confianca: 'Confirmada' },
        { empresa: 'Concorrente B', hibrido: 'Hibrido nao informado', volume: '140 sc', confianca: 'Provavel' },
        { empresa: 'Ainda aberto', hibrido: '-', volume: '260 sc', confianca: '-' },
      ],
      historico: client?.historico?.map((h: any) => ({ tipo: h.tipo, data: new Date(h.data).toLocaleDateString('pt-BR'), detalhe: h.detalhe })) || [
        { tipo: 'Visita tecnica', data: '12 ago', detalhe: '2 decisores presentes' },
        { tipo: 'Convite para dia de campo', data: '28 jul', detalhe: 'aguardando confirmacao' },
        { tipo: 'Atualizacao de potencial', data: '04 jul', detalhe: '+180 ha de milho' },
      ],
      indice: client?.indiceOportunidade || 92,
      negociacoes: [
        { produto: 'Produto A', estagio: 'Confirmado', volume: '220 sc', data: '28/ago' },
        { produto: 'Produto B', estagio: 'Em negociacao', volume: '180 sc', data: '02/set' },
        { produto: 'Produto C', estagio: 'Confirmado', volume: '100 sc', data: '15/ago' },
      ],
      proximaMelhorAcao: 'Existem 180 sc em negociacao e a regiao ja esta 68% rodada. Priorizar fechamento do Produto B nesta semana.',
      decisores: client?.decisores?.map((d: any) => ({ nome: d.nome, cargo: d.cargo, papel: d.papel })) || [
        { nome: 'Carlos Mendes', cargo: 'Proprietario', papel: 'Decisor' },
        { nome: 'Marina Lopes', cargo: 'Agronoma', papel: 'Influenciadora' },
      ],
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Erro interno' })
  }
})

export default router