import type { Metadata } from 'next'
export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Manage Requests' }
export { default } from '@/modules/user/pages/ManageRequestPage'
