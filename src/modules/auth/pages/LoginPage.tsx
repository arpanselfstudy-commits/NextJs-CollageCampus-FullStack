'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import '@/styles/design.css'
import { useLogin } from '../hooks/useLogin'
import AuthLogo from '../components/common/AuthLogo'
import AuthFooter from '../components/common/AuthFooter'
import FormError from '../components/common/FormError'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const { mutate: login, isPending, error } = useLogin()

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    login({ email, password })
  }

  const errMsg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message

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

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Institutional Email</label>
              <div className="input-wrapper">
                <span className="input-icon"><Mail size={16} /></span>
                <input type="email" placeholder="name@university.edu" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>

            <div className="form-group">
              <div className="form-label-row">
                <label className={`form-label${errMsg ? ' form-label--error' : ''}`}>Security Password</label>
                <Link href="/forgot-password" className="forgot-link">Forgot?</Link>
              </div>
              <div className={`input-wrapper${errMsg ? ' input-wrapper--error' : ''}`}>
                <span className="input-icon"><Lock size={16} /></span>
                <input type={showPw ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="button" className="input-action" onClick={() => setShowPw(!showPw)}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <FormError message={errMsg} />
            </div>

            <button className="btn btn-primary" type="submit" disabled={isPending}>
              {isPending ? 'Signing in…' : <><span>Sign In to Dashboard</span><ArrowRight size={16} /></>}
            </button>
          </form>

          <p className="auth-alt-link">
            New to the campus ecosystem?{' '}
            <Link href="/register">Request an invite</Link>
          </p>
        </div>
      </div>

      <AuthFooter />
    </div>
  )
}
