'use client'

import { useState } from 'react'
import { useJobs } from '../hooks/useJobs'
import JobsView from '@/modules/jobs/components/JobsView'

export default function JobsPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [jobType, setJobType] = useState('')
  const [minExperience, setMinExperience] = useState<number | ''>('')
  const [maxExperience, setMaxExperience] = useState<number | ''>('')
  const [minSalary, setMinSalary] = useState<number | ''>('')
  const [maxSalary, setMaxSalary] = useState<number | ''>('')
  const [deadlineFrom, setDeadlineFrom] = useState('')
  const [deadlineTo, setDeadlineTo] = useState('')

  const { data, isLoading } = useJobs({
    page,
    limit: 9,
    search: search || undefined,
    jobType: jobType || undefined,
    minExperience: minExperience !== '' ? minExperience : undefined,
    maxExperience: maxExperience !== '' ? maxExperience : undefined,
    minSalary: minSalary !== '' ? minSalary : undefined,
    maxSalary: maxSalary !== '' ? maxSalary : undefined,
    deadlineFrom: deadlineFrom || undefined,
    deadlineTo: deadlineTo || undefined,
  })

  const handleClearFilters = () => {
    setJobType('')
    setMinExperience('')
    setMaxExperience('')
    setMinSalary('')
    setMaxSalary('')
    setDeadlineFrom('')
    setDeadlineTo('')
    setPage(1)
  }

  return (
    <JobsView
      jobs={data?.jobs ?? []}
      isLoading={isLoading}
      search={search}
      onSearchChange={(v) => { setSearch(v); setPage(1) }}
      jobType={jobType}
      onJobTypeChange={(t) => { setJobType(t); setPage(1) }}
      minExperience={minExperience}
      onMinExperienceChange={(v) => { setMinExperience(v); setPage(1) }}
      maxExperience={maxExperience}
      onMaxExperienceChange={(v) => { setMaxExperience(v); setPage(1) }}
      minSalary={minSalary}
      onMinSalaryChange={(v) => { setMinSalary(v); setPage(1) }}
      maxSalary={maxSalary}
      onMaxSalaryChange={(v) => { setMaxSalary(v); setPage(1) }}
      deadlineFrom={deadlineFrom}
      onDeadlineFromChange={(v) => { setDeadlineFrom(v); setPage(1) }}
      deadlineTo={deadlineTo}
      onDeadlineToChange={(v) => { setDeadlineTo(v); setPage(1) }}
      onClearFilters={handleClearFilters}
      page={page}
      pagination={data?.pagination}
      onPageChange={setPage}
    />
  )
}
