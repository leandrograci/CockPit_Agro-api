import { Router, Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'
import { authenticate, AuthRequest } from '../middleware/auth'
import { z } from 'zod'

const router = Router()

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
})

function signTokens(userId: string, role: string) {
  const accessToken = jwt.sign(
    { sub: userId, role },
    process.env.JWT_SECRET!,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { expiresIn: (process.env.JWT_EXPIRES_IN || '1h') as any }
  )
  const refreshToken = jwt.sign(
    { sub: userId, role },
    process.env.JWT_REFRESH_SECRET!,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as any }
  )
  return { accessToken, refreshToken }
}

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const body = loginSchema.parse(req.body)
    const user = await prisma.user.findUnique({ where: { email: body.email } })
    if (!user) { res.status(401).json({ message: 'Credenciais invalidas' }); return }
    const valid = await bcrypt.compare(body.password, user.passwordHash)
    if (!valid) { res.status(401).json({ message: 'Credenciais invalidas' }); return }
    const tokens = signTokens(user.id, user.role)
    res.json({ ...tokens, user: { id: user.id, name: user.name, email: user.email, role: user.role, area: user.area } })
  } catch (e: any) {
    if (e?.name === 'ZodError') { res.status(400).json({ message: 'Dados invalidos', errors: e.errors }); return }
    res.status(500).json({ message: 'Erro interno' })
  }
})

// POST /api/auth/refresh
router.post('/refresh', async (req: Request, res: Response) => {
  const { refreshToken } = req.body
  if (!refreshToken) { res.status(401).json({ message: 'Refresh token nao fornecido' }); return }
  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { sub: string; role: string }
    const user = await prisma.user.findUnique({ where: { id: payload.sub } })
    if (!user) { res.status(401).json({ message: 'Usuario nao encontrado' }); return }
    const tokens = signTokens(user.id, user.role)
    res.json({ ...tokens, user: { id: user.id, name: user.name, email: user.email, role: user.role, area: user.area } })
  } catch {
    res.status(401).json({ message: 'Refresh token invalido' })
  }
})

// GET /api/auth/me
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } })
    if (!user) { res.status(404).json({ message: 'Usuario nao encontrado' }); return }
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role, area: user.area })
  } catch { res.status(500).json({ message: 'Erro interno' }) }
})

export default router