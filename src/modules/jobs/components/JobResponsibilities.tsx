'use client'

import { CheckCircle } from 'lucide-react'
import styles from './JobDetailView.module.css'

interface JobResponsibilitiesProps {
  responsibilities: string[]
}

export default function JobResponsibilities({ responsibilities }: JobResponsibilitiesProps) {
  if (responsibilities.length === 0) return null

  return (
    <div className="job-section">
      <h2 className="job-section-title">Responsibilities</h2>
      <div className="requirements-grid">
        {responsibilities.map((item, i) => (
          <div className="req-item" key={i}>
            <CheckCircle size={16} color="#3730d4" className={styles.reqIcon} />
            {item}
          </div>
        ))}
      </div>
    </div>
  )
}
