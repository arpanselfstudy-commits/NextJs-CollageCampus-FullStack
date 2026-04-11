import type { Metadata } from 'next'
export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'My Profile' }
import MyProfilePage from '@/modules/user/pages/MyProfilePage'
export default function Page() { return <MyProfilePage /> }
