import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...')

  // ─── Safras ──────────────────────────────────────────────────────────────
  const safra2526 = await prisma.harvest.upsert({
    where: { nome: '2025/2026' },
    update: {},
    create: { nome: '2025/2026', ativo: true },
  })

  const safra2425 = await prisma.harvest.upsert({
    where: { nome: '2024/2025' },
    update: { ativo: false },
    create: { nome: '2024/2025', ativo: false },
  })

  console.log(`✅ Safras criadas: ${safra2526.nome}, ${safra2425.nome}`)

  // ─── Áreas ───────────────────────────────────────────────────────────────
  const areaBrasil = await prisma.area.upsert({
    where: { id: 'area-brasil-root' },
    update: {},
    create: {
      id: 'area-brasil-root',
      nome: 'Brasil',
      parentId: null,
    },
  })

  const areaSP = await prisma.area.upsert({
    where: { id: 'area-sp' },
    update: {},
    create: {
      id: 'area-sp',
      nome: 'São Paulo',
      parentId: areaBrasil.id,
    },
  })

  const areaMT = await prisma.area.upsert({
    where: { id: 'area-mt' },
    update: {},
    create: {
      id: 'area-mt',
      nome: 'Mato Grosso',
      parentId: areaBrasil.id,
    },
  })

  console.log(`✅ Áreas criadas: ${areaBrasil.nome}, ${areaSP.nome}, ${areaMT.nome}`)

  // ─── Usuário Admin ────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin@123', 10)

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@cockpit.agro' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@cockpit.agro',
      passwordHash: adminPassword,
      role: 'admin',
      area: 'Brasil',
    },
  })

  console.log(`✅ Usuário admin criado: ${adminUser.email}`)

  // ─── Usuário RTV de exemplo ───────────────────────────────────────────────
  const rtvPassword = await bcrypt.hash('Rtv@123456', 10)

  const rtvUser = await prisma.user.upsert({
    where: { email: 'rtv.sp@cockpit.agro' },
    update: {},
    create: {
      name: 'RTV São Paulo',
      email: 'rtv.sp@cockpit.agro',
      passwordHash: rtvPassword,
      role: 'rtv',
      area: 'São Paulo',
    },
  })

  console.log(`✅ Usuário RTV criado: ${rtvUser.email}`)

  // ─── Cliente de exemplo ───────────────────────────────────────────────────
  const clienteExemplo = await prisma.client.upsert({
    where: { id: 'client-exemplo-001' },
    update: {},
    create: {
      id: 'client-exemplo-001',
      nome: 'Fazenda Boa Vista',
      municipio: 'Ribeirão Preto',
      estado: 'SP',
      segmento: 'A',
      carteira: 'Estratégica',
      hectaresTotal: 1500,
      potencialEstimado: 180000,
      indiceOportunidade: 75,
      canal: 'Direto',
      areaId: areaSP.id,
    },
  })

  await prisma.clientCulture.upsert({
    where: { id: 'culture-exemplo-001' },
    update: {},
    create: {
      id: 'culture-exemplo-001',
      clientId: clienteExemplo.id,
      cultura: 'Milho',
      epoca: 'Safrinha',
      hectares: 800,
    },
  })

  await prisma.clientCulture.upsert({
    where: { id: 'culture-exemplo-002' },
    update: {},
    create: {
      id: 'culture-exemplo-002',
      clientId: clienteExemplo.id,
      cultura: 'Soja',
      epoca: 'Verão',
      hectares: 700,
    },
  })

  console.log(`✅ Cliente de exemplo criado: ${clienteExemplo.nome}`)

  console.log('\n🎉 Seed concluído com sucesso!')
  console.log('\n📋 Credenciais para acesso:')
  console.log('   Admin  → email: admin@cockpit.agro   | senha: Admin@123')
  console.log('   RTV SP → email: rtv.sp@cockpit.agro  | senha: Rtv@123456')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
