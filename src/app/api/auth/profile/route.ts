import { NextRequest } from 'next/server'
import { withErrorHandler } from '../../../../backend/lib/withErrorHandler'
import { sendSuccess } from '../../../../backend/lib/response'
import { validate } from '../../../../backend/lib/validate'
import { AppError } from '../../../../backend/lib/appError'
import { getAuthUser } from '../../../../backend/lib/authGuard'
import { updateProfileSchema } from '../../../../backend/validators/auth.validator'
import { updateProfile } from '../../../../backend/services/auth.service'

export const PATCH = withErrorHandler(async (req: NextRequest) => {
  const user = await getAuthUser()
  if (!user) {
    throw new AppError('Unauthorized', 401, 'UNAUTHORIZED')
  }
  const body = await req.json()
  const data = validate(updateProfileSchema, body)
  const updatedUser = await updateProfile(user._id.toString(), data)
  return sendSuccess(updatedUser, 'Profile updated')
})
