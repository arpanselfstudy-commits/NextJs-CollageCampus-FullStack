import { NextRequest } from 'next/server'
import { withErrorHandler } from '../../../../backend/lib/withErrorHandler'
import { sendSuccess } from '../../../../backend/lib/response'
import { getAuthUser } from '../../../../backend/lib/authGuard'
import { validate } from '../../../../backend/lib/validate'
import { AppError } from '../../../../backend/lib/appError'
import { getListedProducts } from '../../../../backend/services/listedProduct.service'
import { listProductsQuerySchema } from '../../../../backend/validators/listedProduct.validator'

export const GET = withErrorHandler(async (req: NextRequest) => {
  const user = await getAuthUser()
  if (!user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED')
  const { searchParams } = new URL(req.url)
  const filters = validate(listProductsQuerySchema, Object.fromEntries(searchParams))
  const result = await getListedProducts({ ...filters, userId: user._id.toString() })
  return sendSuccess(result)
})
