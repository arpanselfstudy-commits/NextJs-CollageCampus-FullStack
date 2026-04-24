'use client'

import { useState, useActionState } from 'react'
import BackButton from '@/components/common/BackButton/BackButton'
import { GraduationCap, Check, X, AlertTriangle, ShieldCheck } from 'lucide-react'
import '@/styles/design.css'
import { resetPasswordAction } from '../actions/auth.actions'
import { FormError } from '@/components/common'
import Input from '@/components/common/Input/Input'
import { usePasswordStrength } from '../hooks/usePasswordStrength'

interface Props { token: string }

const initialState = { success: false, message: '' }

export default function ResetPasswordPage({ token }: Props) {
  const [passwordValue, setPasswordValue] = useState('')
  const [confirmValue, setConfirmValue] = useState('')

  const [state, formAction, isPending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      formData.set('token', token)
      return resetPasswordAction(_prev, formData)
    },
    initialState
  )

  const { strength, strengthLabel } = usePasswordStrength(passwordValue)
  const passwordMismatch = confirmValue.length > 0 && confirmValue !== passwordValue

  if (!token) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4ff' }}>
        <div style={{ textAlign: 'center', padding: 48 }}>
          <AlertTriangle size={48} color="#e53e3e" style={{ margin: '0 auto 16px' }} />
          <p style={{ fontWeight: 600, fontSize: 18 }}>Invalid or missing reset token.</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f0f4ff', padding: 24, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, maxWidth: 900, width: '100%', borderRadius: 20, overflow: 'hidden', boxShadow: '0 8px 40px rgba(55,48,212,0.12)' }}>
        <div className="auth-left auth-left--dark" style={{ padding: 48, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', minHeight: 560 }}>
          <div style={{ marginBottom: 'auto', paddingTop: 8 }}>
            <div className="security-badge">
              <span className="security-badge-dot" />
              Security Protocol
            </div>
          </div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 className="auth-left-headline" style={{ color: 'white', fontSize: 36 }}>
              Protecting your<br />
              <span style={{ color: '#00d4aa' }}>Academic<br />Identity.</span>
            </h2>
            <p className="auth-left-sub auth-left-sub--white" style={{ marginTop: 16 }}>
              Create a robust new password to ensure your research, credits, and campus profile remain exclusively yours.
            </p>
          </div>
        </div>

        <div style={{ background: 'white', padding: '48px 48px' }}>
          <div className="cn-logo" style={{ marginBottom: 28 }}>
            <div className="cn-logo-icon"><GraduationCap size={18} /></div>
            Campus Next
          </div>

          <h2 className="auth-form-title">Reset Password</h2>
          <p className="auth-form-subtitle">Please enter and confirm your new credentials below.</p>

          <form action={formAction}>
            <div className="form-group">
              <Input
                label="New Password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={passwordValue}
                onChange={(e) => setPasswordValue(e.target.value)}
              />
              {passwordValue.length > 0 && (
                <>
                  <div className="strength-bar">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={`strength-bar-seg${i <= strength ? ' strength-bar-seg--filled' : ''}`} />
                    ))}
                  </div>
                  <p className="strength-label">Strength: {strengthLabel}</p>
                </>
              )}
            </div>

            <div className="form-group">
              <Input
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmValue}
                onChange={(e) => setConfirmValue(e.target.value)}
                error={passwordMismatch ? 'Passwords do not match.' : undefined}
                rightIcon={
                  !passwordMismatch && confirmValue.length > 0
                    ? <Check size={16} color="#38a169" />
                    : undefined
                }
              />
            </div>

            <div className="password-rules">
              <div className="password-rule">
                {passwordValue.length >= 8 ? <Check size={14} color="#38a169" /> : <X size={14} color="#9ca3af" />}
                At least 8 characters long
              </div>
              <div className="password-rule">
                {/[^a-zA-Z0-9]/.test(passwordValue) ? <Check size={14} color="#38a169" /> : <X size={14} color="#9ca3af" />}
                Contains one special character
              </div>
            </div>

            {state.message && !state.success && (
              <FormError message={state.message} />
            )}

            <button
              className="btn btn-primary"
              type="submit"
              disabled={isPending || passwordMismatch || !passwordValue}
            >
              {isPending ? 'Resetting…' : <><ShieldCheck size={16} /><span>Reset Password</span></>}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <BackButton href="/login" label="Back to Login" />
          </div>
        </div>
      </div>
    </div>
  )
}
