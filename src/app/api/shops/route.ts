import { NextRequest } from 'next/server'
import { withErrorHandler } from '../../../backend/lib/withErrorHandler'
import { sendSuccess } from '../../../backend/lib/response'
import { getAuthUser } from '../../../backend/lib/authGuard'
import { validate } from '../../../backend/lib/validate'
import { authorize } from '../../../backend/lib/authorize'
import { AppError } from '../../../backend/lib/appError'
import { getShops, createShop } from '../../../backend/services/shop.service'
import { listShopsQuerySchema, createShopSchema } from '../../../backend/validators/shop.validator'
import { UserRole } from '../../../backend/types/backend.types'

export const GET = withErrorHandler(async (req: NextRequest) => {
  const user = await getAuthUser()
  if (!user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED')
  const { searchParams } = new URL(req.url)
  const filters = validate(listShopsQuerySchema, Object.fromEntries(searchParams))
  const result = await getShops(filters)
  return sendSuccess(result)
})

export const POST = withErrorHandler(async (req: NextRequest) => {
  const user = await getAuthUser()
  authorize(user, UserRole.ADMIN)
  const body = await req.json()
  const data = validate(createShopSchema, body)
  const shop = await createShop(data, user!._id.toString())
  return sendSuccess(shop, 'Shop created', 201)
})
