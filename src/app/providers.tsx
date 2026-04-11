'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { queryClient } from '@/lib/react-query/queryClient'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 14,
            fontWeight: 500,
            borderRadius: 12,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          },
          success: {
            iconTheme: { primary: '#3730d4', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#e53e3e', secondary: '#fff' },
          },
        }}
      />
    </QueryClientProvider>
  )
}
