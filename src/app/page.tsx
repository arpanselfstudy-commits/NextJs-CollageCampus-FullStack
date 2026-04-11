import { redirect } from 'next/navigation'

// Root redirects to login as the opening page
export default function RootPage() {
  redirect('/login')
}
