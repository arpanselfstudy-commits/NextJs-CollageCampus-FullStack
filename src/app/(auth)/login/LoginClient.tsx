'use client'

import dynamic from 'next/dynamic'

const LoginPage = dynamic(() => import('@/modules/auth/pages/LoginPage'), {
  ssr: false,
  loading: () => null,
})

export default function LoginClient() {
  return <LoginPage />
}
