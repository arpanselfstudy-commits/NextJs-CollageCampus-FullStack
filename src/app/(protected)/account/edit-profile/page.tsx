import type { Metadata } from 'next'
export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Edit Profile' }
import EditProfilePage from '@/modules/user/pages/EditProfilePage'
export default function Page() { return <EditProfilePage /> }
