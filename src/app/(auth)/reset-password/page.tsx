import { Metadata } from 'next'
import { Suspense } from 'react'
import ResetPasswordInner from './ResetPasswordInner'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Reset Password',
  robots: { index: false, follow: false },
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordInner />
    </Suspense>
  )
}
