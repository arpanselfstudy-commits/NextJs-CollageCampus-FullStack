import { Suspense } from 'react'
import { PageLoader } from '@/components/common/Loader/Loader'
import Footer from '@/components/common/Footer/Footer'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      <Suspense fallback={<PageLoader />}>
        <main style={{ flex: 1 }}>{children}</main>
      </Suspense>
      <Footer variant="auth" />
    </div>
  )
}
