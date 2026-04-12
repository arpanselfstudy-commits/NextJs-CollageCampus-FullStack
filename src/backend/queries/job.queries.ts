import { cache } from 'react'
import { connectDB } from '../lib/db'
import { getJobs as getJobsService, getJobById as getJobByIdService } from '../services/job.service'

export const getJobs = cache(async (filters: Parameters<typeof getJobsService>[0] = {}) => {
  await connectDB()
  return getJobsService(filters)
})

export const getJobById = cache(async (id: string) => {
  await connectDB()
  return getJobByIdService(id)
})
