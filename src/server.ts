import 'dotenv/config'
import express from 'express'
import cors from 'cors'

import authRoutes from './routes/auth'
import clientsRoutes from './routes/clients'
import cockpitRoutes from './routes/cockpit'
import marketRoutes from './routes/market'
import trackingRoutes from './routes/tracking'

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
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

app.listen(PORT, () => {
  console.log(`🚀 CockPit Agro API rodando em http://localhost:${PORT}`)
  console.log(`   Ambiente: ${process.env.NODE_ENV}`)
})

export default app
