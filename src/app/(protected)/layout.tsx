'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Suspense } from 'react'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { PageLoader } from '@/components/common/Loader/Loader'

function ProtectedGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const router = useRouter()
  // Wait for Zustand persist to rehydrate from localStorage before checking auth.
  // Without this, the initial render always sees isAuthenticated=false and redirects.
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.replace('/login')
    }
  }, [hydrated, isAuthenticated, router])

  // Show loader while store is rehydrating
  if (!hydrated) return <PageLoader />
  if (!isAuthenticated) return null

  return <>{children}</>
}

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<PageLoader />}>
      <ProtectedGuard>{children}</ProtectedGuard>
    </Suspense>
  )
}
