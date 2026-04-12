import { z } from 'zod'
import { JobType } from '../types/backend.types'

const contactDetailsSchema = z.object({
  email: z.string().email(),
  phoneNo: z.string(),
})

export const createJobSchema = z.object({
  jobName: z.string().min(1),
  jobProvider: z.string().min(1),
  type: z.nativeEnum(JobType),
  deadline: z.string().transform(s => new Date(s)),
  location: z.string().min(1),
  experience: z.number().min(0),
  salary: z.object({ from: z.number().min(0), to: z.number().min(0) }),
  jobDescription: z.string().min(1),
  responsibilities: z.array(z.string()).min(1),
  contactDetails: contactDetailsSchema,
})
export const updateJobSchema = createJobSchema.partial()

export const listJobsQuerySchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  search: z.string().optional(),
  jobType: z.nativeEnum(JobType).optional(),
  minExperience: z.coerce.number().optional(),
  maxExperience: z.coerce.number().optional(),
  minSalary: z.coerce.number().optional(),
  maxSalary: z.coerce.number().optional(),
  deadlineFrom: z.string().optional(),
  deadlineTo: z.string().optional(),
})
