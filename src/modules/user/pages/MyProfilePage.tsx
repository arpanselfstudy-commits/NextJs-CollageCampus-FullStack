'use client'

import { useState } from 'react'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { useMyListedProducts, useDeleteListedProduct } from '@/modules/marketplace/hooks/useListedProducts'
import { useMyRequestedProducts, useDeleteRequestedProduct } from '@/modules/marketplace/hooks/useRequestedProducts'
import MyProfileView from '@/modules/user/components/MyProfileView'

export default function MyProfilePage() {
  const [tab, setTab] = useState<'listings' | 'requests'>('listings')
  const user = useAuthStore((s) => s.user)

  const { data: listedData, isLoading: listedLoading } = useMyListedProducts({ limit: 50 })
  const { data: requestedData, isLoading: requestedLoading } = useMyRequestedProducts({ limit: 50 })
  const { mutate: deleteListed } = useDeleteListedProduct()
  const { mutate: deleteRequested } = useDeleteRequestedProduct()

  return (
    <MyProfileView
      user={user}
      tab={tab}
      onTabChange={setTab}
      listings={listedData?.products ?? []}
      listedLoading={listedLoading}
      requests={requestedData?.products ?? []}
      requestedLoading={requestedLoading}
      onDeleteListed={(id) => deleteListed(id)}
      onDeleteRequested={(id) => deleteRequested(id)}
    />
  )
}
