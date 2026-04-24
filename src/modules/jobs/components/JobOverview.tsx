'use client'

import { Clock, MapPin, Briefcase, DollarSign, GraduationCap } from 'lucide-react'
import { JOB_TYPE_LABEL } from '@/utils/globalStaticData'
import type { Job } from '@/modules/jobs/types'

interface JobOverviewProps {
  job: Job
}

export default function JobOverview({ job }: JobOverviewProps) {
  const items = [
    {
      Icon: Clock,
      label: 'Deadline',
      value: new Date(job.deadline).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    },
    {
      Icon: MapPin,
      label: 'Location',
      value: job.location,
    },
    {
      Icon: Briefcase,
      label: 'Job Type',
      value: JOB_TYPE_LABEL[job.type] ?? job.type,
    },
    {
      Icon: DollarSign,
      label: 'Salary Range',
      value: `${job.salary.from.toLocaleString()} – ${job.salary.to.toLocaleString()}`,
    },
    {
      Icon: GraduationCap,
      label: 'Experience',
      value: job.experience > 0 ? `${job.experience}+ years` : 'No experience required',
    },
  ]

  return (
    <div className="job-overview-card">
      <div className="job-overview-title">Job Overview</div>
      {items.map(({ Icon, label, value }) => (
        <div className="overview-item" key={label}>
          <div className="overview-icon">
            <Icon size={18} color="#3730d4" />
          </div>
          <div>
            <div className="overview-label">{label}</div>
            <div className="overview-value">{value}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
