import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { withErrorHandler } from '../../../../backend/lib/withErrorHandler'
import { sendSuccess } from '../../../../backend/lib/response'
import { setAuthCookies } from '../../../../backend/lib/cookies'
import { AppError } from '../../../../backend/lib/appError'
import { refreshUserToken } from '../../../../backend/services/auth.service'

export const POST = withErrorHandler(async (_req: NextRequest) => {
  const cookieStore = await cookies()
  const token = cookieStore.get('refreshToken')?.value
  if (!token) {
    throw new AppError('No refresh token', 401, 'INVALID_TOKEN')
  }
  const { accessToken: newAccess, refreshToken: newRefresh } = await refreshUserToken(token)
  await setAuthCookies(newAccess, newRefresh)
  return sendSuccess(null, 'Token refreshed')
})
