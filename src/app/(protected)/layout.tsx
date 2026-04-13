'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { PageLoader } from '@/components/common/Loader/Loader'
import AppHeader from '@/components/common/AppHeader/AppHeader'
import AppFooter from '@/components/common/AppFooter/AppFooter'

function ProtectedGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const router = useRouter()
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => { setHydrated(true) }, [])

  useEffect(() => {
    if (hydrated && !isAuthenticated) router.replace('/login')
  }, [hydrated, isAuthenticated, router])

  if (!hydrated) return <PageLoader />
  if (!isAuthenticated) return null

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f0f2f8', fontFamily: "'Inter',sans-serif" }}>
      <AppHeader />
      <main style={{ flex: 1 }}>{children}</main>
      <AppFooter />
    </div>
  )
}

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<PageLoader />}>
      <ProtectedGuard>{children}</ProtectedGuard>
    </Suspense>
  )
}
