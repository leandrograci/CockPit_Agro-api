-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'rtv',
    "area" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Area" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "parentId" TEXT,

    CONSTRAINT "Area_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Harvest" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Harvest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "municipio" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'SP',
    "segmento" TEXT NOT NULL DEFAULT 'C',
    "carteira" TEXT NOT NULL DEFAULT 'Geral',
    "hectaresTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "potencialEstimado" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "indiceOportunidade" INTEGER NOT NULL DEFAULT 50,
    "canal" TEXT,
    "areaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientCulture" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "cultura" TEXT NOT NULL,
    "epoca" TEXT,
    "hectares" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "ClientCulture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Decisor" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "papel" TEXT NOT NULL,
    "telefone" TEXT,
    "email" TEXT,

    CONSTRAINT "Decisor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientHistorico" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "detalhe" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientHistorico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketReading" (
    "id" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,
    "harvestId" TEXT NOT NULL,
    "cultura" TEXT NOT NULL,
    "epoca" TEXT,
    "potencialTotal" DOUBLE PRECISION NOT NULL,
    "mercadoRodado" DOUBLE PRECISION NOT NULL,
    "confianca" TEXT NOT NULL DEFAULT 'Medio',
    "fonte" TEXT NOT NULL DEFAULT 'Leitura da equipe comercial',
    "dataLeitura" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketReading_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Negotiation" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "harvestId" TEXT NOT NULL,
    "produto" TEXT NOT NULL,
    "estagio" TEXT NOT NULL DEFAULT 'Em negociacao',
    "volume" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unidade" TEXT NOT NULL DEFAULT 'Sacas',
    "dataDecisao" TIMESTAMP(3),
    "proximaAcao" TEXT,
    "responsavelId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Negotiation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetitiveTracking" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "harvestId" TEXT NOT NULL,
    "empresa" TEXT NOT NULL,
    "hibrido" TEXT,
    "volume" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unidade" TEXT NOT NULL DEFAULT 'Sacas',
    "confianca" TEXT NOT NULL DEFAULT 'Estimada',
    "dataInfo" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "responsavelId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompetitiveTracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DemandActivity" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "harvestId" TEXT NOT NULL,
    "clienteNome" TEXT NOT NULL,
    "fazenda" TEXT,
    "municipio" TEXT,
    "cultura" TEXT NOT NULL,
    "epoca" TEXT,
    "finalidade" TEXT,
    "areaTotal" DOUBLE PRECISION,
    "objetivo" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Planejada',
    "responsavelId" TEXT NOT NULL,
    "dataCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DemandActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityTreatment" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "empresa" TEXT NOT NULL,
    "hibrido" TEXT NOT NULL,
    "populacao" INTEGER,
    "area" DOUBLE PRECISION,
    "tecnologia" TEXT,

    CONSTRAINT "ActivityTreatment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityImplantacao" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "dataPlantio" TIMESTAMP(3),
    "populacao" INTEGER,
    "espacamento" DOUBLE PRECISION,
    "areaImplantada" DOUBLE PRECISION,
    "condicao" TEXT,
    "sistema" TEXT,
    "observacoes" TEXT,

    CONSTRAINT "ActivityImplantacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityEvaluation" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "dataAvaliacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estadio" TEXT,
    "populacaoObserv" INTEGER,
    "uniformidade" TEXT,
    "acamamento" DOUBLE PRECISION,
    "quebramento" DOUBLE PRECISION,
    "avaliacaoTecnica" TEXT,
    "percepcaoCliente" TEXT,

    CONSTRAINT "ActivityEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityHarvest" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "dataColheita" TIMESTAMP(3),
    "tipo" TEXT NOT NULL DEFAULT 'grao',
    "areaColhida" DOUBLE PRECISION,
    "pesoBruto" DOUBLE PRECISION,
    "umidade" DOUBLE PRECISION,
    "umidadePadrao" DOUBLE PRECISION DEFAULT 13,
    "impureza" DOUBLE PRECISION DEFAULT 1,
    "pesoLimpo" DOUBLE PRECISION,
    "pesoCorrigido" DOUBLE PRECISION,
    "produtividadeKgHa" DOUBLE PRECISION,
    "produtividadeScHa" DOUBLE PRECISION,
    "pesoMassaVerde" DOUBLE PRECISION,
    "materiaSecaPct" DOUBLE PRECISION,
    "alturaCorte" DOUBLE PRECISION,
    "resultadoTecnico" TEXT,
    "percepcaoFinal" TEXT,
    "conclusao" TEXT,
    "proximaAcao" TEXT,

    CONSTRAINT "ActivityHarvest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArrastaoRecord" (
    "id" TEXT NOT NULL,
    "harvestId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "empresa" TEXT NOT NULL,
    "hibrido" TEXT,
    "volume" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unidade" TEXT NOT NULL DEFAULT 'Sacas',
    "responsavelId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArrastaoRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiagnoseRecord" (
    "id" TEXT NOT NULL,
    "pontoVenda" TEXT NOT NULL,
    "municipio" TEXT,
    "segmento" TEXT NOT NULL,
    "empresa" TEXT NOT NULL,
    "produto" TEXT,
    "volume" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unidade" TEXT NOT NULL DEFAULT 'Sacas',
    "responsavelId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiagnoseRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Harvest_nome_key" ON "Harvest"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "ActivityImplantacao_activityId_key" ON "ActivityImplantacao"("activityId");

-- CreateIndex
CREATE UNIQUE INDEX "ActivityHarvest_activityId_key" ON "ActivityHarvest"("activityId");

-- AddForeignKey
ALTER TABLE "Area" ADD CONSTRAINT "Area_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Area"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientCulture" ADD CONSTRAINT "ClientCulture_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Decisor" ADD CONSTRAINT "Decisor_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientHistorico" ADD CONSTRAINT "ClientHistorico_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketReading" ADD CONSTRAINT "MarketReading_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketReading" ADD CONSTRAINT "MarketReading_harvestId_fkey" FOREIGN KEY ("harvestId") REFERENCES "Harvest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketReading" ADD CONSTRAINT "MarketReading_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Negotiation" ADD CONSTRAINT "Negotiation_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Negotiation" ADD CONSTRAINT "Negotiation_harvestId_fkey" FOREIGN KEY ("harvestId") REFERENCES "Harvest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Negotiation" ADD CONSTRAINT "Negotiation_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitiveTracking" ADD CONSTRAINT "CompetitiveTracking_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitiveTracking" ADD CONSTRAINT "CompetitiveTracking_harvestId_fkey" FOREIGN KEY ("harvestId") REFERENCES "Harvest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitiveTracking" ADD CONSTRAINT "CompetitiveTracking_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemandActivity" ADD CONSTRAINT "DemandActivity_harvestId_fkey" FOREIGN KEY ("harvestId") REFERENCES "Harvest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemandActivity" ADD CONSTRAINT "DemandActivity_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityTreatment" ADD CONSTRAINT "ActivityTreatment_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "DemandActivity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityImplantacao" ADD CONSTRAINT "ActivityImplantacao_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "DemandActivity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityEvaluation" ADD CONSTRAINT "ActivityEvaluation_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "DemandActivity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityHarvest" ADD CONSTRAINT "ActivityHarvest_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "DemandActivity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArrastaoRecord" ADD CONSTRAINT "ArrastaoRecord_harvestId_fkey" FOREIGN KEY ("harvestId") REFERENCES "Harvest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArrastaoRecord" ADD CONSTRAINT "ArrastaoRecord_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArrastaoRecord" ADD CONSTRAINT "ArrastaoRecord_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiagnoseRecord" ADD CONSTRAINT "DiagnoseRecord_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
