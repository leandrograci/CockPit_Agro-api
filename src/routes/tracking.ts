import { Router, Response } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth'
import { prisma } from '../lib/prisma'

const router = Router()

// ─── Helper ──────────────────────────────────────────────────────────────────
async function getActiveHarvest() {
  return prisma.harvest.findFirst({ where: { ativo: true } })
}

// ─── GET /api/negotiations ────────────────────────────────────────────────────
router.get('/negotiations', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const harvest = await getActiveHarvest()
    if (!harvest) {
      return res.json([])
    }

    const negotiations = await prisma.negotiation.findMany({
      where: { harvestId: harvest.id },
      include: { client: true, responsavel: true },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    })

    const data = negotiations.map((n) => ({
      id: n.id,
      cliente: n.client.nome,
      produto: n.produto,
      estagio: n.estagio,
      volume: n.volume,
      decisao: n.dataDecisao
        ? new Date(n.dataDecisao).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
        : '—',
      atualizacao: new Date(n.updatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
    }))

    res.json(data)
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Erro ao carregar negociações' })
  }
})

// ─── POST /api/negotiations ───────────────────────────────────────────────────
router.post('/negotiations', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { clienteNome, produto, estagio, volume, unidade, dataDecisao, proximaAcao } = req.body

    const harvest = await getActiveHarvest()
    if (!harvest) {
      return res.status(400).json({ message: 'Nenhuma safra ativa encontrada' })
    }

    // Busca ou cria o cliente pelo nome
    let client = await prisma.client.findFirst({ where: { nome: { contains: clienteNome, mode: 'insensitive' } } })
    if (!client) {
      client = await prisma.client.create({
        data: {
          nome: clienteNome,
          municipio: 'Não informado',
          segmento: 'C',
          carteira: 'Geral',
        },
      })
    }

    const negotiation = await prisma.negotiation.create({
      data: {
        clientId: client.id,
        harvestId: harvest.id,
        produto: produto || 'Não informado',
        estagio: estagio || 'Em negociacao',
        volume: Number(volume) || 0,
        unidade: unidade || 'Sacas',
        dataDecisao: dataDecisao ? new Date(dataDecisao) : null,
        proximaAcao: proximaAcao || null,
        responsavelId: req.userId!,
      },
    })

    res.status(201).json(negotiation)
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Erro ao salvar negociação' })
  }
})

// ─── GET /api/tracking/foco-clients ──────────────────────────────────────────
router.get('/tracking/foco-clients', authenticate, async (_req: AuthRequest, res: Response) => {
  try {
    const clients = await prisma.client.findMany({
      where: { carteira: 'Foco' },
      orderBy: { indiceOportunidade: 'desc' },
      take: 20,
    })

    // Mock values for rodado/aberto since we don't have per-client market data
    const data = clients.length > 0
      ? clients.map((c, i) => ({
          id: c.id,
          nome: c.nome,
          municipio: c.municipio,
          indice: c.indiceOportunidade,
          potencial: c.potencialEstimado,
          rodado: [68, 55, 72, 48, 61][i % 5],
          aberto: Math.round(c.potencialEstimado * 0.35),
        }))
      : [
          { id: '1', nome: 'Fazenda Horizonte', municipio: 'Ribeirão Preto', indice: 92, potencial: 1000, rodado: 70, aberto: 300 },
          { id: '2', nome: 'Grupo Santa Clara', municipio: 'Barretos', indice: 86, potencial: 850, rodado: 59, aberto: 350 },
          { id: '3', nome: 'Fazenda Primavera', municipio: 'Orlândia', indice: 89, potencial: 540, rodado: 44, aberto: 302 },
          { id: '4', nome: 'Grupo São Bento', municipio: 'Franca', indice: 78, potencial: 480, rodado: 63, aberto: 178 },
        ]

    res.json(data)
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Erro ao carregar clientes foco' })
  }
})

// ─── POST /api/tracking/competitive ──────────────────────────────────────────
router.post('/tracking/competitive', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { clienteFocoId, empresa, hibrido, volume, unidade, confianca, dataInfo } = req.body

    const harvest = await getActiveHarvest()
    if (!harvest) {
      return res.status(400).json({ message: 'Nenhuma safra ativa encontrada' })
    }

    // Valida se o cliente existe (ou usa o primeiro disponível como fallback)
    let clientId = clienteFocoId
    if (!clientId) {
      const first = await prisma.client.findFirst({ where: { carteira: 'Foco' } })
      if (!first) return res.status(400).json({ message: 'Nenhum cliente foco encontrado' })
      clientId = first.id
    } else {
      const exists = await prisma.client.findUnique({ where: { id: clientId } })
      if (!exists) return res.status(400).json({ message: 'Cliente não encontrado' })
    }

    const tracking = await prisma.competitiveTracking.create({
      data: {
        clientId,
        harvestId: harvest.id,
        empresa: empresa || 'Não informado',
        hibrido: hibrido || null,
        volume: Number(volume) || 0,
        unidade: unidade || 'Sacas',
        confianca: confianca || 'Estimada',
        dataInfo: dataInfo ? new Date(dataInfo) : new Date(),
        responsavelId: req.userId!,
      },
    })

    res.status(201).json(tracking)
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Erro ao salvar decisão competitiva' })
  }
})

// ─── POST /api/tracking/arrastao ─────────────────────────────────────────────
router.post('/tracking/arrastao', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { clienteNome, safra, empresa, hibrido, volume, unidade } = req.body

    // Encontra a safra (ativa ou pelo nome)
    const harvest = safra
      ? await prisma.harvest.findFirst({ where: { nome: { contains: safra } } }) ?? await getActiveHarvest()
      : await getActiveHarvest()

    if (!harvest) {
      return res.status(400).json({ message: 'Safra não encontrada' })
    }

    // Busca ou cria o cliente
    let client = await prisma.client.findFirst({ where: { nome: { contains: clienteNome || '', mode: 'insensitive' } } })
    if (!client) {
      client = await prisma.client.create({
        data: {
          nome: clienteNome || 'Cliente não identificado',
          municipio: 'Não informado',
          segmento: 'C',
          carteira: 'Geral',
        },
      })
    }

    const record = await prisma.arrastaoRecord.create({
      data: {
        harvestId: harvest.id,
        clientId: client.id,
        empresa: empresa || 'Não informado',
        hibrido: hibrido || null,
        volume: Number(volume) || 0,
        unidade: unidade || 'Sacas',
        responsavelId: req.userId!,
      },
    })

    res.status(201).json(record)
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Erro ao salvar registro de arrastão' })
  }
})

// ─── POST /api/tracking/diagnose ─────────────────────────────────────────────
router.post('/tracking/diagnose', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { pontoVenda, municipio, segmento, empresa, produto, volume, unidade } = req.body

    const record = await prisma.diagnoseRecord.create({
      data: {
        pontoVenda: pontoVenda || 'Não informado',
        municipio: municipio || null,
        segmento: segmento || 'Distribuição',
        empresa: empresa || 'Não informado',
        produto: produto || null,
        volume: Number(volume) || 0,
        unidade: unidade || 'Sacas',
        responsavelId: req.userId!,
      },
    })

    res.status(201).json(record)
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Erro ao salvar registro de diagnose' })
  }
})

// ─── POST /api/tracking/market-reading ───────────────────────────────────────
// Salvar leitura de mercado rodado regional
router.post('/tracking/market-reading', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { areaNome, dataLeitura, potencialTotal, mercadoRodado, confianca, fonte, cultura } = req.body

    const harvest = await getActiveHarvest()
    if (!harvest) {
      return res.status(400).json({ message: 'Nenhuma safra ativa encontrada' })
    }

    // Busca ou cria a área
    let area = await prisma.area.findFirst({ where: { nome: { contains: areaNome || 'SP Interior', mode: 'insensitive' } } })
    if (!area) {
      area = await prisma.area.findFirst()
    }
    if (!area) {
      area = await prisma.area.create({ data: { nome: areaNome || 'SP Interior' } })
    }

    const reading = await prisma.marketReading.create({
      data: {
        areaId: area.id,
        harvestId: harvest.id,
        cultura: cultura || 'Milho',
        potencialTotal: Number(potencialTotal) || 0,
        mercadoRodado: Number(mercadoRodado) || 0,
        confianca: confianca || 'Medio',
        fonte: fonte || 'Leitura da equipe comercial',
        dataLeitura: dataLeitura ? new Date(dataLeitura) : new Date(),
        userId: req.userId!,
      },
    })

    res.status(201).json(reading)
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Erro ao salvar leitura de mercado' })
  }
})

export default router
