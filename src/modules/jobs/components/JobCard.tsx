import Link from 'next/link'
import { Briefcase, MapPin, Clock } from 'lucide-react'
import { JOB_TYPE_LABEL } from '@/utils/globalStaticData'
import type { Job } from '@/modules/jobs/types'
import styles from './JobsView.module.css'

export interface JobCardProps {
  job: Job
  /** 'main' = full grid card used on /jobs page, 'compact' = smaller card used on landing */
  variant?: 'main' | 'compact'
}

export default function JobCard({ job, variant = 'main' }: JobCardProps) {
  const id = job._id ?? job.jobId

  if (variant === 'compact') {
    return (
      <div className="job-card">
        <div className="job-card-header">
          <div className="job-icon"><Briefcase size={20} color="#3730d4" /></div>
          <span className="job-badge">{JOB_TYPE_LABEL[job.type] ?? job.type}</span>
        </div>
        <div className="job-title">{job.jobName}</div>
        <div className="job-meta">
          <span>{job.jobProvider}</span>
          <span className={styles.metaRow}><MapPin size={11} />{job.location}</span>
          <span className={styles.salary}>
            ${job.salary.from.toLocaleString()} – ${job.salary.to.toLocaleString()}
          </span>
        </div>
        <Link href={`/jobs/${id}`} className="btn btn-outline">Details</Link>
      </div>
    )
  }

  return (
    <div className="job-card-main">
      <div className="job-card-main-header">
        <div className="job-company-logo"><Briefcase size={22} color="#3730d4" /></div>
        <span className="job-new-badge">{JOB_TYPE_LABEL[job.type] ?? job.type}</span>
      </div>
      <div className="job-card-main-title">{job.jobName}</div>
      <div className="job-card-main-meta">
        {job.jobProvider}
        <span className={styles.metaRow}><MapPin size={11} />{job.location}</span>
        <span className={styles.metaRow}><Clock size={11} />Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
        <span className={styles.salary}>${job.salary.from.toLocaleString()} – ${job.salary.to.toLocaleString()}</span>
      </div>
      <Link href={`/jobs/${id}`} className="btn btn-outline">Details</Link>
    </div>
  )
}
