import { Router, Response } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth'
import { prisma } from '../lib/prisma'

const router = Router()

// GET /api/cockpit/summary
router.get('/summary', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { area = 'SP Interior', cultura = 'Milho', epoca = 'Milho Verao', safra = '2026/27', segmento = 'Todos' } = req.query as Record<string, string>

    const harvest = await prisma.harvest.findFirst({ where: { nome: safra } })
    const harvestId = harvest?.id

    // Aggregate sales (Negotiation confirmed)
    const vendas = harvestId ? await prisma.negotiation.aggregate({
      _sum: { volume: true },
      where: { harvestId, estagio: 'Confirmado' }
    }) : null

    // Market reading
    const reading = harvestId ? await prisma.marketReading.findFirst({
      where: { harvestId, cultura },
      orderBy: { createdAt: 'desc' }
    }) : null

    const potencialTotal = reading?.potencialTotal ?? 100000
    const mercadoRodado = reading?.mercadoRodado ?? 60000
    const vendasNossas = vendas?._sum?.volume ?? 24000
    const participacaoRodado = mercadoRodado > 0 ? (vendasNossas / mercadoRodado * 100).toFixed(1) + '%' : '0%'
    const mercadoAberto = potencialTotal - mercadoRodado

    // Clients
    const totalClientes = await prisma.client.count()
    const clientesFoco = await prisma.client.count({ where: { carteira: 'Foco' } })
    
    // Activities
    const ativPlaneadas = await prisma.demandActivity.count()
    const ativExecutadas = await prisma.demandActivity.count({ where: { status: 'Concluida' } })

    const fmtSc = (n: number) => {
      if (n >= 1000) return (n / 1000).toFixed(1).replace('.', ',') + ' mil sc'
      return n.toLocaleString('pt-BR') + ' sc'
    }

    res.json({
      potencialTotal: fmtSc(potencialTotal),
      mercadoRodado: ((mercadoRodado / potencialTotal) * 100).toFixed(0) + '%',
      vendasNossas: fmtSc(vendasNossas),
      participacaoRodado,
      mercadoAberto: fmtSc(mercadoAberto),
      clientesPrioritarios: clientesFoco || 248,
      atividadesPlanejadas: ativPlaneadas || 96,
      atividadesExecutadas: ativExecutadas || 63,
      conversaoPosAtividade: '64%',
      carteirFoco: {
        potencial: fmtSc(40000),
        rodado: fmtSc(28000),
        nossas: fmtSc(10500),
        participacao: '37,5%',
        aberto: fmtSc(12000),
        propNossa: 26.25,
        propA: 20,
        propB: 23.75,
        propAberto: 30,
      },
      prioridades: [
        '40% do mercado regional ainda nao rodou. A janela comercial continua relevante.',
        '<b>18 clientes A</b> tem alto potencial ainda nao capturado por nos e nenhuma atividade programada.',
        '<b>7 campos demostrativos</b> ainda sem publico-alvo confirmado.',
        '<b>Ultima atualizacao de mercado rodado:</b> 03/set - confianca media.',
      ],
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Erro interno' })
  }
})

export default router