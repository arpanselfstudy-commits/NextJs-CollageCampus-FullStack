import { NextRequest } from 'next/server'
import { withErrorHandler } from '../../../../backend/lib/withErrorHandler'
import { sendSuccess } from '../../../../backend/lib/response'
import { getAuthUser } from '../../../../backend/lib/authGuard'
import { validate } from '../../../../backend/lib/validate'
import { authorize } from '../../../../backend/lib/authorize'
import { getCmsByType, updateCms, deleteCms } from '../../../../backend/services/cms.service'
import { updateCmsSchema } from '../../../../backend/validators/cms.validator'
import { UserRole } from '../../../../backend/types/backend.types'

// Public — no auth required
export const GET = withErrorHandler(async (req: NextRequest, ctx?: { params: Promise<Record<string, string>> }) => {
  const { type } = await ctx!.params
  const cms = await getCmsByType(type.toUpperCase())
  return sendSuccess(cms)
})

export const PUT = withErrorHandler(async (req: NextRequest, ctx?: { params: Promise<Record<string, string>> }) => {
  const user = await getAuthUser()
  authorize(user, UserRole.ADMIN)
  const { type } = await ctx!.params
  const body = await req.json()
  const data = validate(updateCmsSchema, body)
  const cms = await updateCms(type, data)
  return sendSuccess(cms)
})

export const DELETE = withErrorHandler(async (req: NextRequest, ctx?: { params: Promise<Record<string, string>> }) => {
  const user = await getAuthUser()
  authorize(user, UserRole.ADMIN)
  const { type } = await ctx!.params
  await deleteCms(type)
  return sendSuccess(null, 'CMS page deleted')
})
