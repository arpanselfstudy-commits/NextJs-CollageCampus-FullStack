'use client'

import { useSearchParams } from 'next/navigation'
import ResetPasswordPage from '@/modules/auth/pages/ResetPasswordPage'

export default function ResetPasswordInner() {
  const params = useSearchParams()
  const token = params.get('token') ?? ''
  return <ResetPasswordPage token={token} />
}
