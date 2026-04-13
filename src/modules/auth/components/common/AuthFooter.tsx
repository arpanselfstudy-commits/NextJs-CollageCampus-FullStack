'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import AuthLogo from './AuthLogo'

const PolicyModal = dynamic(() => import('@/components/common/PolicyModal/PolicyModal'), { ssr: false })

interface Props {
  transparent?: boolean
}

export default function AuthFooter({ transparent }: Props) {
  const [policy, setPolicy] = useState<'Privacy' | 'Terms' | null>(null)

  return (
    <>
      <footer
        className="auth-footer"
        style={transparent ? { background: 'transparent', border: 'none' } : undefined}
      >
        <AuthLogo size={14} />
        <div className="auth-footer-links">
          <button className="auth-footer-link-btn" onClick={() => setPolicy('Privacy')}>Privacy Policy</button>
          <button className="auth-footer-link-btn" onClick={() => setPolicy('Terms')}>Terms of Service</button>
        </div>
        <span>© {new Date().getFullYear()} Campus Next. The Academic Atelier.</span>
      </footer>

      {policy && <PolicyModal type={policy} onClose={() => setPolicy(null)} />}
    </>
  )
}
