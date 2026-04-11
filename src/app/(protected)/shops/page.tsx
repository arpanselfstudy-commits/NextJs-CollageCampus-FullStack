import type { Metadata } from 'next'
export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Shops' }
import ShopsPage from '@/modules/shops/pages/ShopsPage'
export default function Page() { return <ShopsPage /> }
