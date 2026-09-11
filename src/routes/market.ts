import { Router, Response } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth'
import { prisma } from '../lib/prisma'

const router = Router()

// Dados de regiões estáticos enriquecidos com dados do banco
const regioesMock: Record<string, {
  id: string; nome: string; potencial: string; rodado: string
  vendasNossas: string; participacao: string; aberto: string
  atualizacao: string; indice: number; coberturaA: number; coberturaB: number; coberturaC: number
}> = {
  'Ribeirão Preto': {
    id: 'rp', nome: 'Ribeirão Preto', potencial: '28 mil sc', rodado: '68%',
    vendasNossas: '10,5 mil sc', participacao: '55%', aberto: '9 mil sc',
    atualizacao: '03/set', indice: 87, coberturaA: 91, coberturaB: 74, coberturaC: 52,
  },
  'Uberaba': {
    id: 'ub', nome: 'Uberaba', potencial: '22 mil sc', rodado: '55%',
    vendasNossas: '7,2 mil sc', participacao: '59%', aberto: '9,9 mil sc',
    atualizacao: '01/set', indice: 72, coberturaA: 80, coberturaB: 61, coberturaC: 40,
  },
  'Rio Verde': {
    id: 'rv', nome: 'Rio Verde', potencial: '35 mil sc', rodado: '72%',
    vendasNossas: '14,2 mil sc', participacao: '56%', aberto: '9,8 mil sc',
    atualizacao: '02/set', indice: 91, coberturaA: 88, coberturaB: 70, coberturaC: 55,
  },
  'Brasília': {
    id: 'bs', nome: 'Brasília', potencial: '18 mil sc', rodado: '48%',
    vendasNossas: '5,5 mil sc', participacao: '64%', aberto: '9,4 mil sc',
    atualizacao: '28/ago', indice: 64, coberturaA: 72, coberturaB: 53, coberturaC: 35,
  },
  'Franca': {
    id: 'fr', nome: 'Franca', potencial: '20 mil sc', rodado: '61%',
    vendasNossas: '7,8 mil sc', participacao: '64%', aberto: '7,8 mil sc',
    atualizacao: '31/ago', indice: 79, coberturaA: 85, coberturaB: 68, coberturaC: 48,
  },
}

// GET /api/market?regiao=Ribeirão Preto&cultura=Milho
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { regiao = 'Ribeirão Preto', cultura = 'Milho' } = req.query as Record<string, string>

    // Enriquecer com dados reais do banco se houver MarketReadings
    const harvest = await prisma.harvest.findFirst({ where: { ativo: true } })

    let regiaoSelecionada = regioesMock[regiao] ?? regioesMock['Ribeirão Preto']

    // Se tiver leitura real de mercado no banco, sobrescreve os valores
    if (harvest) {
      const area = await prisma.area.findFirst({ where: { nome: { contains: regiao.split(' ')[0] } } })
      if (area) {
        const reading = await prisma.marketReading.findFirst({
          where: { areaId: area.id, harvestId: harvest.id, cultura },
          orderBy: { createdAt: 'desc' },
        })
        if (reading) {
          const pctRodado = reading.potencialTotal > 0
            ? ((reading.mercadoRodado / reading.potencialTotal) * 100).toFixed(0) + '%'
            : regiaoSelecionada.rodado
          const fmtSc = (n: number) => n >= 1000 ? (n / 1000).toFixed(1) + ' mil sc' : n + ' sc'
          regiaoSelecionada = {
            ...regiaoSelecionada,
            potencial: fmtSc(reading.potencialTotal),
            rodado: pctRodado,
            atualizacao: new Date(reading.dataLeitura).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
          }
        }
      }
    }

    res.json({
      regioes: Object.values(regioesMock),
      regiaoSelecionada,
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Erro interno ao carregar dados de mercado' })
  }
})

export default router
