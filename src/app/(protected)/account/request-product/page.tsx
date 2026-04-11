import type { Metadata } from 'next'
export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Request a Product' }
import RequestProductPage from '@/modules/user/pages/RequestProductPage'
export default function Page() { return <RequestProductPage /> }
