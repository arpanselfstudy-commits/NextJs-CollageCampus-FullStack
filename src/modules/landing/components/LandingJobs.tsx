import Link from 'next/link'
import { Briefcase, MapPin, ChevronRight } from 'lucide-react'
import { SectionLoader } from '@/components/common/Loader/Loader'
import { JOB_TYPE_LABEL } from '@/utils/globalStaticData'
import type { Job } from '@/modules/jobs/types'
import styles from './landing.module.css'

interface LandingJobsProps {
  jobs: Job[]
  isLoading: boolean
}

export default function LandingJobs({ jobs, isLoading }: LandingJobsProps) {
  return (
    <section className="landing-section">
      <div className="section-header">
        <div>
          <p className="section-tag">Opportunities</p>
          <h2 className="section-title">Recent Job Openings</h2>
        </div>
        <Link href="/jobs" className="view-all">View all <ChevronRight size={14} /></Link>
      </div>

      {isLoading ? <SectionLoader /> : jobs.length === 0 ? (
        <p className={styles.emptyMsg}>No jobs available right now.</p>
      ) : (
        <div className={styles.jobsGrid}>
          {jobs.slice(0, 6).map((job, i) => (
            <div className="job-card" key={job._id ?? job.jobId ?? i}>
              <div className="job-card-header">
                <div className="job-icon"><Briefcase size={20} color="#3730d4" /></div>
                <span className="job-badge">{JOB_TYPE_LABEL[job.type] ?? job.type}</span>
              </div>
              <div className="job-title">{job.jobName}</div>
              <div className={`job-meta ${styles.jobMeta}`}>
                <span>{job.jobProvider}</span>
                <span className={styles.jobMetaRow}><MapPin size={11} />{job.location}</span>
                <span className={styles.jobSalary}>
                  ${job.salary.from.toLocaleString()} – ${job.salary.to.toLocaleString()}
                </span>
              </div>
              <Link href={`/jobs/${job._id ?? job.jobId}`} className="btn btn-outline">Details</Link>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
