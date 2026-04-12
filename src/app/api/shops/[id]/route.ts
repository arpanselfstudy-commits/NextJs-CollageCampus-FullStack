import { NextRequest } from 'next/server'
import { withErrorHandler } from '../../../../backend/lib/withErrorHandler'
import { sendSuccess } from '../../../../backend/lib/response'
import { getAuthUser } from '../../../../backend/lib/authGuard'
import { validate } from '../../../../backend/lib/validate'
import { authorize } from '../../../../backend/lib/authorize'
import { AppError } from '../../../../backend/lib/appError'
import { getShopById, updateShop, deleteShop } from '../../../../backend/services/shop.service'
import { updateShopSchema } from '../../../../backend/validators/shop.validator'
import { UserRole } from '../../../../backend/types/backend.types'

export const GET = withErrorHandler(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const user = await getAuthUser()
  if (!user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED')
  const { id } = await params
  const shop = await getShopById(id)
  return sendSuccess(shop)
})

export const PUT = withErrorHandler(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const user = await getAuthUser()
  authorize(user, UserRole.ADMIN)
  const { id } = await params
  const body = await req.json()
  const data = validate(updateShopSchema, body)
  const shop = await updateShop(id, data)
  return sendSuccess(shop)
})

export const DELETE = withErrorHandler(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const user = await getAuthUser()
  authorize(user, UserRole.ADMIN)
  const { id } = await params
  await deleteShop(id)
  return sendSuccess(null, 'Shop deleted')
})
