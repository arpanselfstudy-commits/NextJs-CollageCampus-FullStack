import { Suspense } from 'react'
import { PageLoader } from '@/components/common/Loader/Loader'
import AppFooter from '@/components/common/AppFooter/AppFooter'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<PageLoader />}>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <main style={{ flex: 1 }}>{children}</main>
        <AppFooter />
      </div>
    </Suspense>
  )
}
