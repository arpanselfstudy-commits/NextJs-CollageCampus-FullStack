import { Metadata } from 'next'
import LoginClient from './LoginClient'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Login',
  robots: { index: false, follow: false },
}

export default function Page() {
  return <LoginClient />
}
