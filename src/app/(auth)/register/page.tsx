import { Metadata } from 'next'
import RegisterPage from '@/modules/auth/pages/RegisterPage'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Register',
  robots: { index: false, follow: false },
}

export default function Page() {
  return <RegisterPage />
}
