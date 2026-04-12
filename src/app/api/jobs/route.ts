import { NextRequest } from 'next/server'
import { withErrorHandler } from '../../../backend/lib/withErrorHandler'
import { sendSuccess } from '../../../backend/lib/response'
import { getAuthUser } from '../../../backend/lib/authGuard'
import { validate } from '../../../backend/lib/validate'
import { authorize } from '../../../backend/lib/authorize'
import { AppError } from '../../../backend/lib/appError'
import { getJobs, createJob } from '../../../backend/services/job.service'
import { listJobsQuerySchema, createJobSchema } from '../../../backend/validators/job.validator'
import { UserRole } from '../../../backend/types/backend.types'

export const GET = withErrorHandler(async (req: NextRequest) => {
  const user = await getAuthUser()
  if (!user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED')
  const { searchParams } = new URL(req.url)
  const filters = validate(listJobsQuerySchema, Object.fromEntries(searchParams))
  const result = await getJobs(filters)
  return sendSuccess(result)
})

export const POST = withErrorHandler(async (req: NextRequest) => {
  const user = await getAuthUser()
  authorize(user, UserRole.ADMIN)
  const body = await req.json()
  const data = validate(createJobSchema, body)
  const job = await createJob(data, user!._id.toString())
  return sendSuccess(job, 'Job created', 201)
})
