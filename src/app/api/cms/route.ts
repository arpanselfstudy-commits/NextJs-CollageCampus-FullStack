import { NextRequest } from 'next/server'
import { withErrorHandler } from '../../../backend/lib/withErrorHandler'
import { sendSuccess } from '../../../backend/lib/response'
import { getAuthUser } from '../../../backend/lib/authGuard'
import { validate } from '../../../backend/lib/validate'
import { authorize } from '../../../backend/lib/authorize'
import { getAllCmsPages, createCms } from '../../../backend/services/cms.service'
import { createCmsSchema } from '../../../backend/validators/cms.validator'
import { UserRole } from '../../../backend/types/backend.types'

// Public — no auth required
export const GET = withErrorHandler(async () => {
  const pages = await getAllCmsPages()
  return sendSuccess(pages)
})

export const POST = withErrorHandler(async (req: NextRequest) => {
  const user = await getAuthUser()
  authorize(user, UserRole.ADMIN)
  const body = await req.json()
  const data = validate(createCmsSchema, body)
  const cms = await createCms(data)
  return sendSuccess(cms, 'CMS page created', 201)
})
