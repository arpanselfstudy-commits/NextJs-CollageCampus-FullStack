import { NextRequest } from 'next/server'
import { withErrorHandler } from '../../../../backend/lib/withErrorHandler'
import { sendSuccess } from '../../../../backend/lib/response'
import { getAuthUser } from '../../../../backend/lib/authGuard'
import { validate } from '../../../../backend/lib/validate'
import { authorize } from '../../../../backend/lib/authorize'
import { AppError } from '../../../../backend/lib/appError'
import {
  getListedProductById,
  updateListedProduct,
  deleteListedProduct,
} from '../../../../backend/services/listedProduct.service'
import { updateListedProductSchema } from '../../../../backend/validators/listedProduct.validator'
import { UserRole } from '../../../../backend/types/backend.types'

export const GET = withErrorHandler(async (req: NextRequest, ctx?: { params: Promise<Record<string, string>> }) => {
  const user = await getAuthUser()
  if (!user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED')
  const { id } = await ctx!.params
  const product = await getListedProductById(id)
  return sendSuccess(product)
})

export const PUT = withErrorHandler(async (req: NextRequest, ctx?: { params: Promise<Record<string, string>> }) => {
  const user = await getAuthUser()
  authorize(user, UserRole.USER)
  const { id } = await ctx!.params
  const body = await req.json()
  const data = validate(updateListedProductSchema, body)
  const product = await updateListedProduct(id, user!._id.toString(), data)
  return sendSuccess(product)
})

export const DELETE = withErrorHandler(async (req: NextRequest, ctx?: { params: Promise<Record<string, string>> }) => {
  const user = await getAuthUser()
  authorize(user, UserRole.USER)
  const { id } = await ctx!.params
  await deleteListedProduct(id, user!._id.toString())
  return sendSuccess(null, 'Product deleted')
})
