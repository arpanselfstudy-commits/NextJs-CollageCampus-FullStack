import { NextRequest } from 'next/server'
import { withErrorHandler } from '../../../../backend/lib/withErrorHandler'
import { sendSuccess } from '../../../../backend/lib/response'
import { validate } from '../../../../backend/lib/validate'
import { forgotPasswordSchema } from '../../../../backend/validators/auth.validator'
import { forgotPassword } from '../../../../backend/services/auth.service'

export const POST = withErrorHandler(async (req: NextRequest) => {
  const body = await req.json()
  const data = validate(forgotPasswordSchema, body)
  await forgotPassword(data.email)
  return sendSuccess(null, 'Reset email sent')
})
