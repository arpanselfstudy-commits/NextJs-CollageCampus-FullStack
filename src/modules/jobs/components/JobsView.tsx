'use client'

import '@/styles/design.css'
import Link from 'next/link'
import { Briefcase, MapPin, Clock, FileText, X, SlidersHorizontal } from 'lucide-react'
import AppHeader from '@/components/common/AppHeader/AppHeader'
import AppFooter from '@/components/common/AppFooter/AppFooter'
import { JobsSkeletonGrid } from '@/components/common/Loader/SkeletonCard'
import SearchInput from '@/components/common/Search/Search'
import Pagination from '@/components/common/Pagination/Pagination'
import { JOB_TYPE_LABEL } from '@/utils/globalStaticData'
import type { Job } from '@/modules/jobs/types'
import styles from './JobsView.module.css'

const JOB_TYPES = ['full-time', 'part-time'] as const

export interface JobsViewProps {
  jobs: Job[]
  isLoading: boolean
  search: string
  onSearchChange: (v: string) => void
  jobType: string
  onJobTypeChange: (t: string) => void
  minExperience: number | ''
  onMinExperienceChange: (v: number | '') => void
  maxExperience: number | ''
  onMaxExperienceChange: (v: number | '') => void
  minSalary: number | ''
  onMinSalaryChange: (v: number | '') => void
  maxSalary: number | ''
  onMaxSalaryChange: (v: number | '') => void
  deadlineFrom: string
  onDeadlineFromChange: (v: string) => void
  deadlineTo: string
  onDeadlineToChange: (v: string) => void
  onClearFilters: () => void
  page: number
  pagination?: { total: number; page: number; limit: number; pages: number }
  onPageChange: (p: number) => void
}

export default function JobsView({
  jobs, isLoading, search, onSearchChange,
  jobType, onJobTypeChange,
  minExperience, onMinExperienceChange,
  maxExperience, onMaxExperienceChange,
  minSalary, onMinSalaryChange,
  maxSalary, onMaxSalaryChange,
  deadlineFrom, onDeadlineFromChange,
  deadlineTo, onDeadlineToChange,
  onClearFilters,
  page, pagination, onPageChange,
}: JobsViewProps) {
  const hasFilters = !!(jobType || minExperience !== '' || maxExperience !== '' || minSalary !== '' || maxSalary !== '' || deadlineFrom || deadlineTo)

  return (
    <div className="jobs-page">
      <AppHeader />

      <div className="jobs-hero">
        <h1 className="jobs-hero-title">The Next Chapter Starts Here.</h1>
        <p className="jobs-hero-sub">Discover internships, research roles, and part-time opportunities curated specifically for the academic community.</p>
        <div className={styles.searchWrap}>
          <SearchInput placeholder="Search jobs, companies..." defaultValue={search} onSearch={onSearchChange} />
        </div>
      </div>

      <div className="jobs-layout">
        <aside className="jobs-sidebar">
          <div className={styles.sidebarHeader}>
            <span className={styles.sidebarTitle}><SlidersHorizontal size={15} /> Filters</span>
            {hasFilters && (
              <button className={styles.clearAll} onClick={onClearFilters}>
                <X size={12} /> Clear all
              </button>
            )}
          </div>

          {/* Job Type */}
          <div className="sidebar-section">
            <div className="sidebar-section-title">Job Type</div>
            {JOB_TYPES.map((t) => (
              <label className="sidebar-check" key={t}>
                <input
                  type="radio"
                  name="jobType"
                  checked={jobType === t}
                  onChange={() => onJobTypeChange(jobType === t ? '' : t)}
                />
                {t === 'full-time' ? 'Full-Time' : 'Part-Time'}
              </label>
            ))}
          </div>

          {/* Experience */}
          <div className="sidebar-section">
            <div className="sidebar-section-title">Experience (years)</div>
            <div className={styles.rangeRow}>
              <input
                type="number"
                min={0}
                placeholder="Min"
                value={minExperience}
                onChange={(e) => onMinExperienceChange(e.target.value === '' ? '' : Number(e.target.value))}
                className={styles.rangeInput}
              />
              <span className={styles.rangeSep}>–</span>
              <input
                type="number"
                min={0}
                placeholder="Max"
                value={maxExperience}
                onChange={(e) => onMaxExperienceChange(e.target.value === '' ? '' : Number(e.target.value))}
                className={styles.rangeInput}
              />
            </div>
          </div>

          {/* Salary */}
          <div className="sidebar-section">
            <div className="sidebar-section-title">Salary Range</div>
            <div className={styles.rangeRow}>
              <input
                type="number"
                min={0}
                placeholder="Min"
                value={minSalary}
                onChange={(e) => onMinSalaryChange(e.target.value === '' ? '' : Number(e.target.value))}
                className={styles.rangeInput}
              />
              <span className={styles.rangeSep}>–</span>
              <input
                type="number"
                min={0}
                placeholder="Max"
                value={maxSalary}
                onChange={(e) => onMaxSalaryChange(e.target.value === '' ? '' : Number(e.target.value))}
                className={styles.rangeInput}
              />
            </div>
          </div>

          {/* Deadline */}
          <div className="sidebar-section">
            <div className="sidebar-section-title">Deadline Range</div>
            <div className={styles.dateCol}>
              <label className={styles.dateLabel}>From</label>
              <input
                type="date"
                value={deadlineFrom}
                onChange={(e) => onDeadlineFromChange(e.target.value)}
                className={styles.dateInput}
              />
              <label className={styles.dateLabel}>To</label>
              <input
                type="date"
                value={deadlineTo}
                onChange={(e) => onDeadlineToChange(e.target.value)}
                className={styles.dateInput}
              />
            </div>
          </div>

          <div className="cv-card">
            <div className={`cv-card-title ${styles.cvCardTitle}`}><FileText size={15} color="#3730d4" /> Need a CV Review?</div>
            <div className="cv-card-sub">Get expert feedback from the Career Center advisors.</div>
            <a href="#" className="cv-card-link">Book Session</a>
          </div>
        </aside>

        <div>
          <div className={styles.resultsHeader}>
            {!isLoading && (
              <span className={styles.resultsCount}>
                {pagination ? `${pagination.total} job${pagination.total !== 1 ? 's' : ''} found` : `${jobs.length} result${jobs.length !== 1 ? 's' : ''}`}
              </span>
            )}
          </div>

          {isLoading ? <JobsSkeletonGrid count={9} /> : jobs.length === 0 ? (
            <div className={styles.emptyState}>
              <Briefcase size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
              <p>No jobs found. Try adjusting your filters.</p>
              {hasFilters && <button className={styles.clearFiltersBtn} onClick={onClearFilters}>Clear filters</button>}
            </div>
          ) : (
            <>
              <div className="jobs-grid-main">
                {jobs.map((job, i) => {
                  const id = job._id ?? job.jobId
                  return (
                    <div className="job-card-main" key={id ?? i}>
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
                })}
              </div>
              {pagination && (
                <Pagination page={page} pages={pagination.pages} onPageChange={onPageChange} />
              )}
            </>
          )}
        </div>
      </div>

      <AppFooter />
    </div>
  )
}
