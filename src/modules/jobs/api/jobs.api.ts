import { apiClient } from '@/lib/axios/axiosClient'
import type { Job, JobsResponse, JobsParams } from '../types'

interface ApiResponse<T> { code: number; success: boolean; message: string; data: T }

export const jobsApi = {
  getAll: (params?: JobsParams) =>
    apiClient.get<ApiResponse<JobsResponse>>('/api/jobs', { params }),

  getById: (jobId: string) =>
    apiClient.get<ApiResponse<Job>>(`/api/jobs/${jobId}`),
}
