import { NextRequest } from 'next/server'
import { withErrorHandler } from '../../../../backend/lib/withErrorHandler'
import { sendSuccess } from '../../../../backend/lib/response'
import { getAuthUser } from '../../../../backend/lib/authGuard'
import { validate } from '../../../../backend/lib/validate'
import { authorize } from '../../../../backend/lib/authorize'
import { AppError } from '../../../../backend/lib/appError'
import {
  getRequestedProductById,
  updateRequestedProduct,
  deleteRequestedProduct,
} from '../../../../backend/services/requestedProduct.service'
import { updateRequestedProductSchema } from '../../../../backend/validators/requestedProduct.validator'
import { UserRole } from '../../../../backend/types/backend.types'

export const GET = withErrorHandler(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const user = await getAuthUser()
  if (!user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED')
  const { id } = await params
  const request = await getRequestedProductById(id)
  return sendSuccess(request)
})

export const PUT = withErrorHandler(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const user = await getAuthUser()
  authorize(user, UserRole.USER)
  const { id } = await params
  const body = await req.json()
  const data = validate(updateRequestedProductSchema, body)
  const request = await updateRequestedProduct(id, user!._id.toString(), data)
  return sendSuccess(request)
})

export const DELETE = withErrorHandler(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const user = await getAuthUser()
  authorize(user, UserRole.USER)
  const { id } = await params
  await deleteRequestedProduct(id, user!._id.toString())
  return sendSuccess(null, 'Request deleted')
})
