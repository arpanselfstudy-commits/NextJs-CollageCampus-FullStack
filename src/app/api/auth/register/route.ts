import { NextRequest } from 'next/server'
import { withErrorHandler } from '../../../../backend/lib/withErrorHandler'
import { sendSuccess } from '../../../../backend/lib/response'
import { validate } from '../../../../backend/lib/validate'
import { registerSchema } from '../../../../backend/validators/auth.validator'
import { registerUser } from '../../../../backend/services/auth.service'

export const POST = withErrorHandler(async (req: NextRequest) => {
  const body = await req.json()
  const data = validate(registerSchema, body)
  const user = await registerUser(data)
  return sendSuccess(user, 'Registered successfully', 201)
})
