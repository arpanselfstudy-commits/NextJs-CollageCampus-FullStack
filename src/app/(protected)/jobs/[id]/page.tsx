import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { makeServerQueryClient } from '@/lib/react-query/serverQueryClient'
import { queryKeys } from '@/lib/react-query/queryKeys'
import JobDetailPage from '@/modules/jobs/pages/JobDetailPage'

export const revalidate = 300

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  try {
    const { id } = await params
    const res = await fetch(`${BASE_URL}/api/jobs/${id}`)
    if (!res.ok) return { title: 'Job Not Found' }
    const json = await res.json()
    const job = json.data
    return {
      title: job.jobName,
      description: job.jobDescription?.slice(0, 160),
      openGraph: {
        title: job.jobName,
        description: job.jobDescription?.slice(0, 160),
      },
    }
  } catch {
    return { title: 'Job Not Found' }
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const qc = makeServerQueryClient()

  const res = await fetch(`${BASE_URL}/api/jobs/${id}`)
  if (res.status === 404) notFound()

  if (res.ok) {
    const json = await res.json()
    qc.setQueryData(queryKeys.jobs.byId(id), json.data)
  }

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <JobDetailPage />
    </HydrationBoundary>
  )
}
