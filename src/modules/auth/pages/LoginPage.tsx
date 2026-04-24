'use client'

import { useEffect, useActionState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, ArrowRight } from 'lucide-react'
import '@/styles/design.css'
import { loginAction } from '../actions/auth.actions'
import { useAuthStore } from '../store/auth.store'
import AuthLogo from '../components/common/AuthLogo'
import { FormError } from '@/components/common'
import Input from '@/components/common/Input/Input'

const initialState = { success: false, message: '' }

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState)
  const setAuth = useAuthStore((s) => s.setAuth)
  const router = useRouter()

  // hydrate auth store from the short-lived cookie the server action sets, then navigate
  useEffect(() => {
    if (state.success) {
      const match = document.cookie.match(/(?:^|;\s*)auth-user=([^;]*)/)
      if (match) {
        try {
          const user = JSON.parse(decodeURIComponent(match[1]))
          setAuth(user, '', '')
        } catch { /* ignore */ }
      }
      router.replace('/landing')
    }
  }, [state.success, setAuth, router])

  return (
    <div className="auth-page">
      <div className="auth-body">
        <div className="auth-left">
          <AuthLogo />
          <div>
            <h1 className="auth-left-headline">
              The <span>Academic</span><br />Atelier.
            </h1>
            <p className="auth-left-sub">
              Elevate your campus journey with a high-end digital ecosystem designed for students, dreamers, and doers.
            </p>
            <div className="auth-left-avatars">
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#c7d2fe', border: '2px solid white', display: 'inline-block' }} />
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#a5b4fc', border: '2px solid white', display: 'inline-block', marginLeft: -8 }} />
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#818cf8', border: '2px solid white', display: 'inline-block', marginLeft: -8 }} />
              <span style={{ marginLeft: 12, fontSize: 13, color: '#4b5563' }}>
                Joined by <strong>12k+</strong> students this semester
              </span>
            </div>
          </div>
        </div>

        <div className="auth-right">
          <h2 className="auth-form-title">Welcome Back</h2>
          <p className="auth-form-subtitle">Please enter your credentials to access the atelier.</p>

          <form action={formAction}>
            <div className="form-group">
              <Input
                label="Institutional Email"
                name="email"
                type="email"
                placeholder="name@university.edu"
                leftIcon={<Mail size={16} />}
              />
            </div>

            <div className="form-group">
              <div className="form-label-row">
                <span className="form-label">Security Password</span>
                <Link href="/forgot-password" className="forgot-link">Forgot?</Link>
              </div>
              <Input
                name="password"
                type="password"
                placeholder="••••••••"
                leftIcon={<Lock size={16} />}
              />
            </div>

            {state.message && !state.success && (
              <FormError message={state.message} />
            )}

            <button className="btn btn-primary" type="submit" disabled={isPending}>
              {isPending ? 'Signing in…' : <><span>Sign In to Dashboard</span><ArrowRight size={16} /></>}
            </button>
          </form>

          <p className="auth-alt-link">
            New to the campus ecosystem?{' '}
            <Link href="/register">Create an account.</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
