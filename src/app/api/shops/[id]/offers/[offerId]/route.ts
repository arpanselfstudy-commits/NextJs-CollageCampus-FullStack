import { NextRequest } from 'next/server'
import { withErrorHandler } from '../../../../../../backend/lib/withErrorHandler'
import { sendSuccess } from '../../../../../../backend/lib/response'
import { getAuthUser } from '../../../../../../backend/lib/authGuard'
import { validate } from '../../../../../../backend/lib/validate'
import { authorize } from '../../../../../../backend/lib/authorize'
import { updateOffer, deleteOffer } from '../../../../../../backend/services/shop.service'
import { updateOfferSchema } from '../../../../../../backend/validators/shop.validator'
import { UserRole } from '../../../../../../backend/types/backend.types'

export const PUT = withErrorHandler(async (req: NextRequest, { params }: { params: Promise<{ id: string; offerId: string }> }) => {
  const user = await getAuthUser()
  authorize(user, UserRole.ADMIN)
  const { id, offerId } = await params
  const body = await req.json()
  const data = validate(updateOfferSchema, body)
  const shop = await updateOffer(id, offerId, data)
  return sendSuccess(shop)
})

export const DELETE = withErrorHandler(async (req: NextRequest, { params }: { params: Promise<{ id: string; offerId: string }> }) => {
  const user = await getAuthUser()
  authorize(user, UserRole.ADMIN)
  const { id, offerId } = await params
  await deleteOffer(id, offerId)
  return sendSuccess(null, 'Offer deleted')
})
