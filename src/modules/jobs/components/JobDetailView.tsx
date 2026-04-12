'use client'

import '@/styles/design.css'
import Link from 'next/link'
import BackButton from '@/components/common/BackButton/BackButton'
import { MapPin, Clock, Briefcase, DollarSign, GraduationCap, CheckCircle } from 'lucide-react'
import AppHeader from '@/components/common/AppHeader/AppHeader'
import AppFooter from '@/components/common/AppFooter/AppFooter'
import { PageLoader } from '@/components/common/Loader/Loader'
import dynamic from 'next/dynamic'
const ContactModal = dynamic(() => import('@/components/common/Modal/ContactModal'), { ssr: false, loading: () => null })
import { JOB_TYPE_LABEL } from '@/utils/globalStaticData'
import type { Job } from '@/modules/jobs/types'
import styles from './JobDetailView.module.css'

export interface JobDetailViewProps {
  job?: Job
  isLoading: boolean
  showContact: boolean
  onShowContact: () => void
  onCloseContact: () => void
}

export default function JobDetailView({ job, isLoading, showContact, onShowContact, onCloseContact }: JobDetailViewProps) {
  if (isLoading) return <div style={{ minHeight: '100vh', background: '#f8faff' }}><AppHeader /><PageLoader /></div>
  if (!job) return (
    <div className={styles.notFound}>
      <AppHeader />
      <div className={styles.notFoundBody}>
        <Briefcase size={48} color="#9ca3af" strokeWidth={1} />
        <p>Job not found.</p>
        <Link href="/jobs" className={styles.notFoundLink}><BackButton href="/jobs" label="Back to Jobs" /></Link>
      </div>
    </div>
  )

  return (
    <div className="job-detail-page">
      <AppHeader />

      <div className="job-detail-body">
        <div className="job-detail-main">
          <BackButton href="/jobs" label="Back to Jobs" />

          <div className="job-detail-hero">
            <div className="job-detail-hero-bg" />
            <div className="job-detail-hero-content">
              <div className="job-detail-logo"><Briefcase size={28} color="#3730d4" /></div>
              <h1 className="job-detail-title">{job.jobName}</h1>
              <p className="job-detail-company">
                {job.jobProvider} • <span className={styles.companyLocation}><MapPin size={12} />{job.location}</span>
              </p>
              <div className="job-tags">
                <span className="job-tag job-tag--type">{JOB_TYPE_LABEL[job.type] ?? job.type}</span>
                <span className="job-tag job-tag--salary">${job.salary.from.toLocaleString()} – ${job.salary.to.toLocaleString()}</span>
                {job.experience > 0 && <span className="job-tag job-tag--dept">{job.experience}+ yrs exp</span>}
              </div>
              <button className="btn btn-primary job-detail-cta" onClick={onShowContact}>View Contact Details</button>
            </div>
          </div>

          <div className="job-section">
            <h2 className="job-section-title">Job Description</h2>
            <p className="job-section-text">{job.jobDescription}</p>
          </div>

          {job.responsibilities.length > 0 && (
            <div className="job-section">
              <h2 className="job-section-title">Responsibilities</h2>
              <div className="requirements-grid">
                {job.responsibilities.map((r, i) => (
                  <div className="req-item" key={i}>
                    <CheckCircle size={16} color="#3730d4" className={styles.reqIcon} />
                    {r}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside>
          <div className="job-overview-card">
            <div className="job-overview-title">Job Overview</div>
            {[
              { Icon: Clock,        label: 'Deadline',     value: new Date(job.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
              { Icon: MapPin,       label: 'Location',     value: job.location },
              { Icon: Briefcase,    label: 'Job Type',     value: JOB_TYPE_LABEL[job.type] ?? job.type },
              { Icon: DollarSign,   label: 'Salary Range', value: `${job.salary.from.toLocaleString()} – ${job.salary.to.toLocaleString()}` },
              { Icon: GraduationCap,label: 'Experience',   value: job.experience > 0 ? `${job.experience}+ years` : 'No experience required' },
            ].map((item) => (
              <div className="overview-item" key={item.label}>
                <div className="overview-icon"><item.Icon size={18} color="#3730d4" /></div>
                <div>
                  <div className="overview-label">{item.label}</div>
                  <div className="overview-value">{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <AppFooter />

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
