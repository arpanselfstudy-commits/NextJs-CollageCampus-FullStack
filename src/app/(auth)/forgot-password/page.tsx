import { Metadata } from 'next'
import ForgotPasswordPage from '@/modules/auth/pages/ForgotPasswordPage'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Forgot Password',
  robots: { index: false, follow: false },
}

export default function Page() {
  return <ForgotPasswordPage />
}
