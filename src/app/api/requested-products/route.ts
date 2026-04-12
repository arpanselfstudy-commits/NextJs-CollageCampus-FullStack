import { NextRequest } from 'next/server'
import { withErrorHandler } from '../../../backend/lib/withErrorHandler'
import { sendSuccess } from '../../../backend/lib/response'
import { getAuthUser } from '../../../backend/lib/authGuard'
import { validate } from '../../../backend/lib/validate'
import { authorize } from '../../../backend/lib/authorize'
import { AppError } from '../../../backend/lib/appError'
import { getRequestedProducts, createRequestedProduct } from '../../../backend/services/requestedProduct.service'
import {
  listRequestedProductsQuerySchema,
  createRequestedProductSchema,
} from '../../../backend/validators/requestedProduct.validator'
import { UserRole } from '../../../backend/types/backend.types'

export const GET = withErrorHandler(async (req: NextRequest) => {
  const user = await getAuthUser()
  if (!user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED')
  const { searchParams } = new URL(req.url)
  const filters = validate(listRequestedProductsQuerySchema, Object.fromEntries(searchParams))
  const result = await getRequestedProducts(filters)
  return sendSuccess(result)
})

export const POST = withErrorHandler(async (req: NextRequest) => {
  const user = await getAuthUser()
  authorize(user, UserRole.USER)
  const body = await req.json()
  const data = validate(createRequestedProductSchema, body)
  const request = await createRequestedProduct(data, user!._id.toString())
  return sendSuccess(request, 'Request created', 201)
})
