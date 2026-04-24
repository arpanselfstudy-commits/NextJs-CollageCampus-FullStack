'use client'

import { SlidersHorizontal, X } from 'lucide-react'
import styles from './JobsView.module.css'

const JOB_TYPES = ['full-time', 'part-time'] as const

export interface JobsFilterProps {
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
}

export default function JobsFilter({
  jobType, onJobTypeChange,
  minExperience, onMinExperienceChange,
  maxExperience, onMaxExperienceChange,
  minSalary, onMinSalaryChange,
  maxSalary, onMaxSalaryChange,
  deadlineFrom, onDeadlineFromChange,
  deadlineTo, onDeadlineToChange,
  onClearFilters,
}: JobsFilterProps) {
  const hasFilters = !!(
    jobType ||
    minExperience !== '' || maxExperience !== '' ||
    minSalary !== '' || maxSalary !== '' ||
    deadlineFrom || deadlineTo
  )

  return (
    <>
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
    </>
  )
}
