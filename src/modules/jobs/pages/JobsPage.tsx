'use client'

import { useJobs } from '../hooks/useJobs'
import { useJobsFilters } from '../hooks/useJobsFilters'
import JobsView from '@/modules/jobs/components/JobsView'

export default function JobsPage() {
  const {
    search, page, jobType, minExperience, maxExperience,
    minSalary, maxSalary, deadlineFrom, deadlineTo,
    handleSearchChange, handleJobTypeChange,
    handleMinExperienceChange, handleMaxExperienceChange,
    handleMinSalaryChange, handleMaxSalaryChange,
    handleDeadlineFromChange, handleDeadlineToChange,
    clearFilters, setPage,
  } = useJobsFilters()

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

  return (
    <JobsView
      jobs={data?.jobs ?? []}
      isLoading={isLoading}
      search={search}
      onSearchChange={handleSearchChange}
      jobType={jobType}
      onJobTypeChange={handleJobTypeChange}
      minExperience={minExperience}
      onMinExperienceChange={handleMinExperienceChange}
      maxExperience={maxExperience}
      onMaxExperienceChange={handleMaxExperienceChange}
      minSalary={minSalary}
      onMinSalaryChange={handleMinSalaryChange}
      maxSalary={maxSalary}
      onMaxSalaryChange={handleMaxSalaryChange}
      deadlineFrom={deadlineFrom}
      onDeadlineFromChange={handleDeadlineFromChange}
      deadlineTo={deadlineTo}
      onDeadlineToChange={handleDeadlineToChange}
      onClearFilters={clearFilters}
      page={page}
      pagination={data?.pagination}
      onPageChange={setPage}
    />
  )
}
