'use client'

import { useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { GraduationCap, Check, X } from 'lucide-react'
import '@/styles/design.css'
import { useRegisterForm } from '../hooks/useRegisterForm'
import AuthLogo from '../components/common/AuthLogo'
import { FormError } from '@/components/common'

const PolicyModal = dynamic(() => import('@/components/common/PolicyModal/PolicyModal'), { ssr: false })

export default function RegisterPage() {
  const [agreed, setAgreed] = useState(false)
  const [policy, setPolicy] = useState<'Privacy' | 'Terms' | null>(null)
  const { register, onSubmit, formState: { errors, isSubmitting }, watch } = useRegisterForm()

  const confirmValue = watch('confirmPassword') ?? ''
  const passwordMismatch = !!errors.confirmPassword

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f0f4ff' }}>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '420px 1fr', gap: 24, maxWidth: 960, margin: '0 auto', width: '100%', alignItems: 'center', padding: 24 }}>
        <div className="auth-left--register" style={{ borderRadius: 16, padding: 32, display: 'flex', flexDirection: 'column', minHeight: 580 }}>
          <AuthLogo white />
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, margin: '8px 0 20px' }}>
            The Academic Atelier for the modern scholar and creator.
          </p>
          <div className="register-img-card">
            <div style={{ height: 200, background: 'linear-gradient(135deg,#c8d8f8,#a5b4fc)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3730d4' }}>
              <GraduationCap size={80} strokeWidth={1} />
            </div>
          </div>
          <p className="register-quote" style={{ marginTop: 'auto' }}>
            &ldquo;Design is not just what it looks like and feels like. Design is how it works.&rdquo;
          </p>
        </div>

        <div style={{ background: 'white', borderRadius: 16, padding: '40px 48px' }}>
          <h2 className="auth-form-title">Create your account</h2>
          <p className="auth-form-subtitle">Join a community of thousands of students and shops.</p>

          <form onSubmit={onSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-wrapper">
                <input type="text" placeholder="Alex Rivera" {...register('name')} />
              </div>
              <FormError message={errors.name?.message} />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-wrapper">
                <input type="email" placeholder="alex@campus.edu" {...register('email')} />
              </div>
              <FormError message={errors.email?.message} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-wrapper">
                  <input type="password" placeholder="••••••••" {...register('password')} />
                </div>
                <FormError message={errors.password?.message} />
              </div>
              <div className="form-group">
                <label className={`form-label${passwordMismatch ? ' form-label--error' : ''}`}>Confirm Password</label>
                <div className={`input-wrapper${passwordMismatch ? ' input-wrapper--error' : ''}`}>
                  <input type="password" placeholder="••••••••" {...register('confirmPassword')} />
                  {!passwordMismatch && confirmValue.length > 0 && <Check size={16} color="#38a169" />}
                  {passwordMismatch && <X size={16} color="#e53e3e" />}
                </div>
                <FormError message={errors.confirmPassword?.message} />
              </div>
            </div>

            <div className="form-check" style={{ marginBottom: 24 }}>
              <input type="checkbox" id="terms" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
              <label htmlFor="terms">
                I agree to the{' '}
                <button type="button" className="auth-footer-link-btn" onClick={() => setPolicy('Terms')}>Terms of Service</button>
                {' '}and{' '}
                <button type="button" className="auth-footer-link-btn" onClick={() => setPolicy('Privacy')}>Privacy Policy</button>.
              </label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <button className="btn btn-primary" type="submit" style={{ width: 'auto', padding: '13px 28px' }} disabled={isSubmitting || !!errors.confirmPassword || !agreed}>
                {isSubmitting ? 'Creating…' : 'Create Account'}
              </button>
              <span style={{ fontSize: 14, color: '#6b7280' }}>
                Already have an account? <Link href="/login" style={{ color: '#3730d4', fontWeight: 600 }}>Sign in</Link>
              </span>
            </div>
          </form>
        </div>
      </div>

      {policy && <PolicyModal type={policy} onClose={() => setPolicy(null)} />}
    </div>
  )
}
