'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useJob } from '../hooks/useJobs'
import JobDetailView from '@/modules/jobs/components/JobDetailView'

export default function JobDetailPage() {
  const params = useParams()
  const id = params?.id as string
  const { data: job, isLoading } = useJob(id)
  const [showContact, setShowContact] = useState(false)

  return (
    <JobDetailView
      job={job}
      isLoading={isLoading}
      showContact={showContact}
      onShowContact={() => setShowContact(true)}
      onCloseContact={() => setShowContact(false)}
    />
  )
}
