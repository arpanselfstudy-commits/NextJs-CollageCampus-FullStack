'use client'

import { useState } from 'react'

export function useJobsFilters() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [jobType, setJobType] = useState('')
  const [minExperience, setMinExperience] = useState<number | ''>('')
  const [maxExperience, setMaxExperience] = useState<number | ''>('')
  const [minSalary, setMinSalary] = useState<number | ''>('')
  const [maxSalary, setMaxSalary] = useState<number | ''>('')
  const [deadlineFrom, setDeadlineFrom] = useState('')
  const [deadlineTo, setDeadlineTo] = useState('')

  const handleSearchChange = (v: string) => { setSearch(v); setPage(1) }
  const handleJobTypeChange = (t: string) => { setJobType(t); setPage(1) }
  const handleMinExperienceChange = (v: number | '') => { setMinExperience(v); setPage(1) }
  const handleMaxExperienceChange = (v: number | '') => { setMaxExperience(v); setPage(1) }
  const handleMinSalaryChange = (v: number | '') => { setMinSalary(v); setPage(1) }
  const handleMaxSalaryChange = (v: number | '') => { setMaxSalary(v); setPage(1) }
  const handleDeadlineFromChange = (v: string) => { setDeadlineFrom(v); setPage(1) }
  const handleDeadlineToChange = (v: string) => { setDeadlineTo(v); setPage(1) }

  const clearFilters = () => {
    setJobType('')
    setMinExperience('')
    setMaxExperience('')
    setMinSalary('')
    setMaxSalary('')
    setDeadlineFrom('')
    setDeadlineTo('')
    setPage(1)
  }

  return {
    search, page, jobType, minExperience, maxExperience,
    minSalary, maxSalary, deadlineFrom, deadlineTo,
    handleSearchChange, handleJobTypeChange,
    handleMinExperienceChange, handleMaxExperienceChange,
    handleMinSalaryChange, handleMaxSalaryChange,
    handleDeadlineFromChange, handleDeadlineToChange,
    clearFilters, setPage,
  }
}
