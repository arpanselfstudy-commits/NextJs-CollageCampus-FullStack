'use client'

import { useState } from 'react'
import { useJobs } from '@/modules/jobs/hooks/useJobs'
import { useShops } from '@/modules/shops/hooks/useShops'
import { useListedProducts } from '@/modules/marketplace/hooks/useListedProducts'
import { useRequestedProducts } from '@/modules/marketplace/hooks/useRequestedProducts'
import LandingView from '@/modules/landing/components/LandingView'

export default function LandingPage() {
  const [mpTab, setMpTab] = useState<'listed' | 'requested'>('listed')

  const { data: jobsData, isLoading: jobsLoading } = useJobs({ limit: 6 })
  const { data: shopsData, isLoading: shopsLoading } = useShops({ limit: 6 })
  const { data: listedData, isLoading: listedLoading } = useListedProducts({ limit: 6 })
  const { data: requestedData, isLoading: requestedLoading } = useRequestedProducts({ limit: 6 })

  return (
    <LandingView
      jobs={jobsData?.jobs ?? []}
      jobsLoading={jobsLoading}
      shops={shopsData?.shops ?? []}
      shopsLoading={shopsLoading}
      listed={listedData?.products ?? []}
      listedLoading={listedLoading}
      requested={requestedData?.products ?? []}
      requestedLoading={requestedLoading}
      mpTab={mpTab}
      onMpTabChange={setMpTab}
    />
  )
}
