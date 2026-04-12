'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, Lock, ArrowRight, Inbox, ArrowLeft } from 'lucide-react'
import '@/styles/design.css'
import { useForgotPassword } from '../hooks/useForgotPassword'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const { mutate: forgot, isPending, isSuccess } = useForgotPassword()

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    forgot(email)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4ff', padding: 24 }}>
      <div className="forgot-card">
        <span className="forgot-badge">Security Center</span>
        <h1 className="forgot-title">
          Forgot<br />
          Your <span>Password?</span>
        </h1>
        <p className="forgot-sub">
          Enter the email address associated with your account and we&apos;ll send a link to reset your password.
        </p>

        {isSuccess ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <Inbox size={48} color="#3730d4" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontWeight: 600, marginBottom: 8 }}>Check your inbox</p>
            <p style={{ fontSize: 14, color: '#6b7280' }}>We sent a reset link to <strong>{email}</strong></p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">University Email</label>
              <div className="input-wrapper">
                <span className="input-icon"><Mail size={16} /></span>
                <input type="email" placeholder="name@campus.edu" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>
            <button className="btn btn-primary" type="submit" style={{ marginTop: 8 }} disabled={isPending}>
              {isPending ? 'Sending…' : <><span>Send Reset Link</span><ArrowRight size={16} /></>}
            </button>
          </form>
        )}

        <p className="forgot-hint"><Lock size={12} /> Link expires in 15 minutes for your security</p>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Link href="/login" className="back-link" style={{ justifyContent: 'center' }}>
            <ArrowLeft size={14} /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}
