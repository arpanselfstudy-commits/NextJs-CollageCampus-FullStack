import type { Metadata } from 'next'
export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Jobs' }
import JobsPage from '@/modules/jobs/pages/JobsPage'
export default function Page() { return <JobsPage /> }
