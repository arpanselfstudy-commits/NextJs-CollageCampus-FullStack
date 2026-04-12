import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { withErrorHandler } from '../../../../backend/lib/withErrorHandler'
import { sendSuccess } from '../../../../backend/lib/response'
import { clearAuthCookies } from '../../../../backend/lib/cookies'
import { logoutUser } from '../../../../backend/services/auth.service'

export const POST = withErrorHandler(async (_req: NextRequest) => {
  const cookieStore = await cookies()
  const token = cookieStore.get('refreshToken')?.value
  if (token) {
    await logoutUser(token)
  }
  await clearAuthCookies()
  return sendSuccess(null, 'Logged out')
})
