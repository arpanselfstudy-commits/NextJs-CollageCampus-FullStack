import { connectDB } from '../lib/db'
import { AppError } from '../lib/appError'
import { JobModel } from '../models/job.model'
import { IJob } from '../types/backend.types'
import { z } from 'zod'
import { createJobSchema, updateJobSchema } from '../validators/job.validator'

type CreateJobInput = z.infer<typeof createJobSchema>
type UpdateJobInput = z.infer<typeof updateJobSchema>

async function generateJobId(): Promise<string> {
  while (true) {
    const id = `Job-${Math.floor(1000 + Math.random() * 9000)}`
    const exists = await JobModel.findOne({ jobId: id })
    if (!exists) return id
  }
}

export async function createJob(data: CreateJobInput, userId: string): Promise<IJob> {
  await connectDB()
  const jobId = await generateJobId()
  const job = await JobModel.create({ ...data, jobId, createdBy: userId })
  return job.toObject() as IJob
}

export async function updateJob(id: string, data: UpdateJobInput): Promise<IJob> {
  await connectDB()
  const job = await JobModel.findByIdAndUpdate(id, data, { new: true, runValidators: true })
  if (!job) throw new AppError('Job not found', 404, 'NOT_FOUND')
  return job.toObject() as IJob
}

export async function deleteJob(id: string): Promise<void> {
  await connectDB()
  const job = await JobModel.findByIdAndDelete(id)
  if (!job) throw new AppError('Job not found', 404, 'NOT_FOUND')
}

export async function getJobs(filters: {
  page?: number
  limit?: number
  search?: string
  jobType?: string
  minExperience?: number
  maxExperience?: number
  minSalary?: number
  maxSalary?: number
  deadlineFrom?: string
  deadlineTo?: string
}) {
  await connectDB()
  const {
    page = 1, limit = 10, search, jobType,
    minExperience, maxExperience, minSalary, maxSalary,
    deadlineFrom, deadlineTo,
  } = filters
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: Record<string, any> = {}

  if (search) {
    const regex = new RegExp(search, 'i')
    query.$or = [{ jobName: regex }, { jobProvider: regex }]
  }
  if (jobType) query.type = jobType
  if (minExperience !== undefined || maxExperience !== undefined) {
    query.experience = {}
    if (minExperience !== undefined) query.experience.$gte = minExperience
    if (maxExperience !== undefined) query.experience.$lte = maxExperience
  }
  if (minSalary !== undefined) query['salary.from'] = { $gte: minSalary }
  if (maxSalary !== undefined) query['salary.to'] = { $lte: maxSalary }
  if (deadlineFrom !== undefined || deadlineTo !== undefined) {
    query.deadline = {}
    if (deadlineFrom !== undefined) query.deadline.$gte = new Date(deadlineFrom)
    if (deadlineTo !== undefined) query.deadline.$lte = new Date(deadlineTo)
  }

  const skip = (page - 1) * limit
  const [jobs, total] = await Promise.all([
    JobModel.find(query).skip(skip).limit(limit).lean(),
    JobModel.countDocuments(query),
  ])

  return {
    jobs,
    total,
    page,
    limit,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
  }
}

export async function getJobById(id: string): Promise<IJob> {
  await connectDB()
  const job = await JobModel.findById(id).lean()
  if (!job) throw new AppError('Job not found', 404, 'NOT_FOUND')
  return job as unknown as IJob
}
