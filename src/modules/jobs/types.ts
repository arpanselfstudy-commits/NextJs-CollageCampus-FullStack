export interface Job {
  _id?: string
  jobId: string
  jobName: string
  jobProvider: string
  type: 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'CONTRACT'
  deadline: string
  location: string
  experience: number
  salary: { from: number; to: number }
  jobDescription: string
  responsibilities: string[]
  contactDetails: { email: string; phoneNo: string }
}

export interface JobsResponse {
  jobs: Job[]
  pagination: { total: number; page: number; limit: number; pages: number }
}

export interface JobsParams {
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
}
