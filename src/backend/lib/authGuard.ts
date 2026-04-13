import { cache } from 'react'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { connectDB } from './db'
import { env } from './env'
import { UserModel } from '../models/user.model'
import type { IUser } from '../types/backend.types'

/**
 * Server-side auth guard wrapped in React cache() so multiple server components
 * in the same request share a single DB lookup.
 * Returns the authenticated user or null — callers decide whether to redirect or return 401.
 *
 * IMPORTANT: We only verify the access token here. We do NOT attempt a silent refresh
 * because server components cannot reliably set cookies mid-request (Next.js limitation).
 * Token refresh is handled exclusively by the client-side axios interceptor via
 * POST /api/auth/refresh, which is a Route Handler that CAN set cookies.
 */
export const getAuthUser = cache(async (): Promise<IUser | null> => {
  try {
    await connectDB()
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('accessToken')?.value

    if (!accessToken) return null

    try {
      const decoded = jwt.verify(accessToken, env.JWT_ACCESS_SECRET) as { id: string }
      const user = await UserModel.findById(decoded.id).select('-password').lean()
      return user ? (user as unknown as IUser) : null
    } catch {
      // access token expired or invalid — client interceptor will handle refresh
      return null
    }
  } catch {
    return null
  }
})
