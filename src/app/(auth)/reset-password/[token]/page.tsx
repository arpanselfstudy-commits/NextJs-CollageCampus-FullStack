import { Metadata } from 'next'
import ResetPasswordPage from '@/modules/auth/pages/ResetPasswordPage'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Reset Password',
  robots: { index: false, follow: false },
}

interface Props {
  params: Promise<{ token: string }>
}

export default async function Page({ params }: Props) {
  const { token } = await params
  return <ResetPasswordPage token={token} />
}
