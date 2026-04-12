import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { makeServerQueryClient } from '@/lib/react-query/serverQueryClient'
import { queryKeys } from '@/lib/react-query/queryKeys'
import JobDetailPage from '@/modules/jobs/pages/JobDetailPage'
import { getJobById } from '@/backend/queries/job.queries'

export const revalidate = 300

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  try {
    const { id } = await params
    const job = await getJobById(id)
    return {
      title: job.jobName,
      description: job.jobDescription?.slice(0, 160),
      openGraph: { title: job.jobName, description: job.jobDescription?.slice(0, 160) },
    }
  } catch {
    return { title: 'Job Not Found' }
  }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const qc = makeServerQueryClient()

  try {
    const job = await getJobById(id)
    qc.setQueryData(queryKeys.jobs.byId(id), job)
  } catch {
    notFound()
  }

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <JobDetailPage />
    </HydrationBoundary>
  )
}
