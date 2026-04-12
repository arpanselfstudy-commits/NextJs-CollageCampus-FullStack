import { NextRequest } from 'next/server'
import { withErrorHandler } from '../../../../../backend/lib/withErrorHandler'
import { sendSuccess } from '../../../../../backend/lib/response'
import { validate } from '../../../../../backend/lib/validate'
import { resetPasswordSchema } from '../../../../../backend/validators/auth.validator'
import { resetPassword } from '../../../../../backend/services/auth.service'

export const POST = withErrorHandler(
  async (req: NextRequest, { params }: { params: Promise<{ token: string }> }) => {
    const { token } = await params
    const body = await req.json()
    const data = validate(resetPasswordSchema, body)
    await resetPassword(token, data.password)
    return sendSuccess(null, 'Password reset successful')
  }
)
