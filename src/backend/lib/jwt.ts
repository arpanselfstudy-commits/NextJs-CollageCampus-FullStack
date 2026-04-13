import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { env } from './env'

export function generateAccessToken(userId: string): string {
  return jwt.sign({ id: userId }, env.JWT_ACCESS_SECRET, { expiresIn: '1m' })
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign({ id: userId }, env.JWT_REFRESH_SECRET, { expiresIn: '7d' })
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}
