'use client'

import { useQuery } from '@tanstack/react-query'
import { jobsApi } from '../api/jobs.api'
import { queryKeys } from '@/lib/react-query/queryKeys'
import type { JobsParams } from '../types'

export function useJobs(params?: JobsParams) {
  return useQuery({
    queryKey: queryKeys.jobs.all(params),
    queryFn: () => jobsApi.getAll(params).then((r) => r.data.data),
  })
}

export function useJob(jobId: string) {
  return useQuery({
    queryKey: queryKeys.jobs.byId(jobId),
    queryFn: () => jobsApi.getById(jobId).then((r) => r.data.data),
    enabled: !!jobId,
  })
}
