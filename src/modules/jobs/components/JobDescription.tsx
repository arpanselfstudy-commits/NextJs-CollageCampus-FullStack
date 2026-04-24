'use client'

interface JobDescriptionProps {
  description: string
}

export default function JobDescription({ description }: JobDescriptionProps) {
  return (
    <div className="job-section">
      <h2 className="job-section-title">Job Description</h2>
      <p className="job-section-text">{description}</p>
    </div>
  )
}
