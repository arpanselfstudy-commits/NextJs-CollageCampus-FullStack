import type { Metadata } from 'next'
export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Marketplace' }
import MarketplacePage from '@/modules/marketplace/pages/MarketplacePage'
export default function Page() { return <MarketplacePage /> }
