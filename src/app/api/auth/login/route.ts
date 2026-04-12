import { NextRequest } from 'next/server'
import { withErrorHandler } from '../../../../backend/lib/withErrorHandler'
import { sendSuccess } from '../../../../backend/lib/response'
import { validate } from '../../../../backend/lib/validate'
import { setAuthCookies } from '../../../../backend/lib/cookies'
import { loginSchema } from '../../../../backend/validators/auth.validator'
import { loginUser } from '../../../../backend/services/auth.service'

export const POST = withErrorHandler(async (req: NextRequest) => {
  const body = await req.json()
  const data = validate(loginSchema, body)
  const deviceInfo = {
    ip: req.headers.get('x-forwarded-for') ?? undefined,
    name: req.headers.get('user-agent') ?? undefined,
  }
  const { accessToken, refreshToken, user } = await loginUser(data.email, data.password, deviceInfo)
  await setAuthCookies(accessToken, refreshToken)
  return sendSuccess(user, 'Login successful')
})
