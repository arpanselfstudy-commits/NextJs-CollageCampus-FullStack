'use client'

import '@/styles/design.css'
import Link from 'next/link'
import BackButton from '@/components/common/BackButton/BackButton'
import { Briefcase } from 'lucide-react'
import { PageLoader } from '@/components/common/Loader/Loader'
import dynamic from 'next/dynamic'
const ContactModal = dynamic(() => import('@/components/common/Modal/ContactModal'), { ssr: false, loading: () => null })
import type { Job } from '@/modules/jobs/types'
import styles from './JobDetailView.module.css'
import JobTitleCard from './JobTitleCard'
import JobOverview from './JobOverview'
import JobDescription from './JobDescription'
import JobResponsibilities from './JobResponsibilities'

export interface JobDetailViewProps {
  job?: Job
  isLoading: boolean
  showContact: boolean
  onShowContact: () => void
  onCloseContact: () => void
}

export default function JobDetailView({ job, isLoading, showContact, onShowContact, onCloseContact }: JobDetailViewProps) {
  if (isLoading) return <div style={{ minHeight: '100vh', background: '#f8faff' }}><PageLoader /></div>

  if (!job) return (
    <div className={styles.notFound}>
      <div className={styles.notFoundBody}>
        <Briefcase size={48} color="#9ca3af" strokeWidth={1} />
        <p>Job not found.</p>
        <Link href="/jobs" className={styles.notFoundLink}>
          <BackButton href="/jobs" label="Back to Jobs" />
        </Link>
      </div>
    </div>
  )

  return (
    <div className="job-detail-page">
      <div className="job-detail-body">
        <div className="job-detail-main">
          <div style={{ marginBottom: 20 }}>
            <BackButton href="/jobs" label="Back to Jobs" />
          </div>

          <JobTitleCard job={job} onShowContact={onShowContact} />
          <JobDescription description={job.jobDescription} />
          <JobResponsibilities responsibilities={job.responsibilities} />
        </div>

        <aside>
          <JobOverview job={job} />
        </aside>
      </div>

      {showContact && (
        <div className="overlay">
          <ContactModal
            name={job.jobProvider}
            role="Hiring Contact"
            email={job.contactDetails.email}
            phone={job.contactDetails.phoneNo}
            onMessage={onCloseContact}
            onClose={onCloseContact}
          />
        </div>
      )}
    </div>
  )
}
