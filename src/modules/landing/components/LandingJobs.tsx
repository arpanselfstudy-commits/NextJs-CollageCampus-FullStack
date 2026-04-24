import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { JobsSkeletonGrid } from '@/components/common/Loader/SkeletonCard'
import type { Job } from '@/modules/jobs/types'
import JobCard from '@/modules/jobs/components/JobCard'
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

      {isLoading ? <JobsSkeletonGrid count={6} /> : jobs.length === 0 ? (
        <p className={styles.emptyMsg}>No jobs available right now.</p>
      ) : (
        <div className={styles.jobsGrid}>
          {jobs.slice(0, 6).map((job, i) => (
            <JobCard key={job._id ?? job.jobId ?? i} job={job} variant="compact" />
          ))}
        </div>
      )}
    </section>
  )
}
