'use client'

import { Briefcase, MapPin } from 'lucide-react'
import { JOB_TYPE_LABEL } from '@/utils/globalStaticData'
import type { Job } from '@/modules/jobs/types'
import styles from './JobDetailView.module.css'

interface JobTitleCardProps {
  job: Job
  onShowContact: () => void
}

export default function JobTitleCard({ job, onShowContact }: JobTitleCardProps) {
  return (
    <div className="job-detail-hero">
      <div className="job-detail-hero-bg" />
      <div className="job-detail-hero-content">
        <div className="job-detail-logo">
          <Briefcase size={28} color="#3730d4" />
        </div>
        <h1 className="job-detail-title">{job.jobName}</h1>
        <p className="job-detail-company">
          {job.jobProvider} •{' '}
          <span className={styles.companyLocation}>
            <MapPin size={12} />
            {job.location}
          </span>
        </p>
        <div className="job-tags">
          <span className="job-tag job-tag--type">
            {JOB_TYPE_LABEL[job.type] ?? job.type}
          </span>
          <span className="job-tag job-tag--salary">
            ${job.salary.from.toLocaleString()} – ${job.salary.to.toLocaleString()}
          </span>
          {job.experience > 0 && (
            <span className="job-tag job-tag--dept">{job.experience}+ yrs exp</span>
          )}
        </div>
        <button className="btn btn-primary job-detail-cta" onClick={onShowContact}>
          View Contact Details
        </button>
      </div>
    </div>
  )
}
