import { Suspense } from 'react'
import { PageLoader } from '@/components/common/Loader/Loader'

// No shared header/footer here — each auth page manages its own layout
// (LoginPage, RegisterPage, ForgotPasswordPage each render AuthFooter internally;
//  ResetPasswordPage renders no footer by design)
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<PageLoader />}>
      {children}
    </Suspense>
  )
}
