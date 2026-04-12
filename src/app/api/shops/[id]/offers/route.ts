import { NextRequest } from 'next/server'
import { withErrorHandler } from '../../../../../backend/lib/withErrorHandler'
import { sendSuccess } from '../../../../../backend/lib/response'
import { getAuthUser } from '../../../../../backend/lib/authGuard'
import { validate } from '../../../../../backend/lib/validate'
import { authorize } from '../../../../../backend/lib/authorize'
import { addOffer } from '../../../../../backend/services/shop.service'
import { createOfferSchema } from '../../../../../backend/validators/shop.validator'
import { UserRole } from '../../../../../backend/types/backend.types'

export const POST = withErrorHandler(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const user = await getAuthUser()
  authorize(user, UserRole.ADMIN)
  const { id } = await params
  const body = await req.json()
  const data = validate(createOfferSchema, body)
  const shop = await addOffer(id, data)
  return sendSuccess(shop, 'Offer added', 201)
})
