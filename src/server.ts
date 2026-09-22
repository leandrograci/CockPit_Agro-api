import 'dotenv/config'
import express from 'express'
import cors from 'cors'

import authRoutes from './routes/auth'
import clientsRoutes from './routes/clients'
import cockpitRoutes from './routes/cockpit'
import marketRoutes from './routes/market'
import trackingRoutes from './routes/tracking'

const app = express()
const PORT = Number(process.env.PORT) || 4000

// Origens permitidas: produção (www + apex) + desenvolvimento local.
// FRONTEND_URL pode sobrescrever/adicionar uma origem via variável de ambiente.
const ALLOWED_ORIGINS = [
  'https://www.cockpitagro.com.br',
  'https://cockpitagro.com.br',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[]

app.use(cors({
  origin: (origin, callback) => {
    // Permite requisições sem Origin (ex: curl, Postman, health checks)
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error(`CORS: origem não permitida — ${origin}`))
    }
  },
  credentials: true,
}))

app.use(express.json())

// Rotas
app.use('/api/auth', authRoutes)
app.use('/api/clients', clientsRoutes)
app.use('/api/cockpit', cockpitRoutes)
app.use('/api/market', marketRoutes)
app.use('/api', trackingRoutes)

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 CockPit Agro API rodando na porta ${PORT}`)
  console.log(`   Ambiente: ${process.env.NODE_ENV}`)
})

export default app
