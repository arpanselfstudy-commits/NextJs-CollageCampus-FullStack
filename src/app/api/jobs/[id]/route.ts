import { NextRequest } from 'next/server'
import { withErrorHandler } from '../../../../backend/lib/withErrorHandler'
import { sendSuccess } from '../../../../backend/lib/response'
import { getAuthUser } from '../../../../backend/lib/authGuard'
import { validate } from '../../../../backend/lib/validate'
import { authorize } from '../../../../backend/lib/authorize'
import { AppError } from '../../../../backend/lib/appError'
import { getJobById, updateJob, deleteJob } from '../../../../backend/services/job.service'
import { updateJobSchema } from '../../../../backend/validators/job.validator'
import { UserRole } from '../../../../backend/types/backend.types'

export const GET = withErrorHandler(async (req: NextRequest, ctx?: { params: Promise<Record<string, string>> }) => {
  const user = await getAuthUser()
  if (!user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED')
  const { id } = await ctx!.params
  const job = await getJobById(id)
  return sendSuccess(job)
})

export const PUT = withErrorHandler(async (req: NextRequest, ctx?: { params: Promise<Record<string, string>> }) => {
  const user = await getAuthUser()
  authorize(user, UserRole.ADMIN)
  const { id } = await ctx!.params
  const body = await req.json()
  const data = validate(updateJobSchema, body)
  const job = await updateJob(id, data)
  return sendSuccess(job)
})

export const DELETE = withErrorHandler(async (req: NextRequest, ctx?: { params: Promise<Record<string, string>> }) => {
  const user = await getAuthUser()
  authorize(user, UserRole.ADMIN)
  const { id } = await ctx!.params
  await deleteJob(id)
  return sendSuccess(null, 'Job deleted')
})
