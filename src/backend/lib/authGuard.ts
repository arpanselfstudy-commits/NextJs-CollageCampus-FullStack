import { cache } from 'react'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { connectDB } from './db'
import { env } from './env'
import { UserModel } from '../models/user.model'
import { refreshUserToken } from '../services/auth.service'
import type { IUser } from '../types/backend.types'

/**
 * Server-side auth guard wrapped in React cache() so multiple server components
 * in the same request share a single DB lookup.
 * Returns the authenticated user or null — callers decide whether to redirect or return 401.
 */
export const getAuthUser = cache(async (): Promise<IUser | null> => {
  try {
    await connectDB()
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('accessToken')?.value

    if (accessToken) {
      try {
        const decoded = jwt.verify(accessToken, env.JWT_ACCESS_SECRET) as { id: string }
        const user = await UserModel.findById(decoded.id).select('-password').lean()
        if (user) return user as unknown as IUser
      } catch {
        // access token expired or invalid — fall through to refresh
      }
    }

    // Attempt silent refresh using the refresh token cookie
    const refreshToken = cookieStore.get('refreshToken')?.value
    if (!refreshToken) return null

    try {
      const { accessToken: newAccess } = await refreshUserToken(refreshToken)
      const decoded = jwt.verify(newAccess, env.JWT_ACCESS_SECRET) as { id: string }
      const user = await UserModel.findById(decoded.id).select('-password').lean()
      // Note: cookie rotation happens in the /api/auth/refresh route handler.
      // In a pure server component context we can only read cookies, not set them.
      return user ? (user as unknown as IUser) : null
    } catch {
      return null
    }
  } catch {
    return null
  }
})
