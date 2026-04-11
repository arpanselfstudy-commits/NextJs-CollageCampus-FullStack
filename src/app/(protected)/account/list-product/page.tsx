import type { Metadata } from 'next'
export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'List a Product' }
import ListProductPage from '@/modules/user/pages/ListProductPage'
export default function Page() { return <ListProductPage /> }
