'use client'

import { useActionState } from 'react'
import BackButton from '@/components/common/BackButton/BackButton'
import { Mail, Lock, ArrowRight, Inbox } from 'lucide-react'
import '@/styles/design.css'
import { forgotPasswordAction } from '../actions/auth.actions'
import { FormError } from '@/components/common'
import Input from '@/components/common/Input/Input'

const initialState = { success: false, message: '' }

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(forgotPasswordAction, initialState)

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

        {state.success ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <Inbox size={48} color="#3730d4" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontWeight: 600, marginBottom: 8 }}>Check your inbox</p>
            <p style={{ fontSize: 14, color: '#6b7280' }}>We sent a reset link to <strong>{state.email}</strong></p>
          </div>
        ) : (
          <form action={formAction}>
            <div className="form-group">
              <Input
                label="University Email"
                name="email"
                type="email"
                placeholder="name@campus.edu"
                leftIcon={<Mail size={16} />}
              />
            </div>

            {state.message && <FormError message={state.message} />}

            <button className="btn btn-primary" type="submit" style={{ marginTop: 8 }} disabled={isPending}>
              {isPending ? 'Sending…' : <><span>Send Reset Link</span><ArrowRight size={16} /></>}
            </button>
          </form>
        )}

        <p className="forgot-hint"><Lock size={12} /> Link expires in 15 minutes for your security</p>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <BackButton href="/login" label="Back to Login" />
        </div>
      </div>
    </div>
  )
}
