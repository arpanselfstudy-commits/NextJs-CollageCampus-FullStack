'use client'

import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { authApi } from '../api/auth.api'
import { useAuthStore } from '../store/auth.store'
import { queryClient } from '@/lib/react-query/queryClient'

export function useLogout() {
  const { clearAuth, refreshToken } = useAuthStore()
  const router = useRouter()

  return async () => {
    try {
      if (refreshToken) await authApi.logout(refreshToken)
    } catch {}
    clearAuth()
    queryClient.clear()
    toast.success('Logged out successfully.')
    router.push('/login')
  }
}
