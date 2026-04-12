import { NextRequest } from 'next/server'
import { withErrorHandler } from '../../../../backend/lib/withErrorHandler'
import { sendSuccess } from '../../../../backend/lib/response'
import { getAuthUser } from '../../../../backend/lib/authGuard'
import { validate } from '../../../../backend/lib/validate'
import { AppError } from '../../../../backend/lib/appError'
import { getRequestedProducts } from '../../../../backend/services/requestedProduct.service'
import { listRequestedProductsQuerySchema } from '../../../../backend/validators/requestedProduct.validator'

export const GET = withErrorHandler(async (req: NextRequest) => {
  const user = await getAuthUser()
  if (!user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED')
  const { searchParams } = new URL(req.url)
  const filters = validate(listRequestedProductsQuerySchema, Object.fromEntries(searchParams))
  const result = await getRequestedProducts({ ...filters, userId: user._id.toString() })
  return sendSuccess(result)
})
