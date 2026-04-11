'use client'

import '@/styles/design.css'
import AppHeader from '@/components/common/AppHeader/AppHeader'
import AppFooter from '@/components/common/AppFooter/AppFooter'
import LandingHero from './LandingHero'
import LandingJobs from './LandingJobs'
import LandingShops from './LandingShops'
import LandingMarketplace from './LandingMarketplace'
import type { Job } from '@/modules/jobs/types'
import type { Shop } from '@/modules/shops/types'
import type { ListedProduct, RequestedProduct } from '@/modules/marketplace/types'

export interface LandingViewProps {
  jobs: Job[]
  jobsLoading: boolean
  shops: Shop[]
  shopsLoading: boolean
  listed: ListedProduct[]
  listedLoading: boolean
  requested: RequestedProduct[]
  requestedLoading: boolean
  mpTab: 'listed' | 'requested'
  onMpTabChange: (tab: 'listed' | 'requested') => void
}

export default function LandingView({
  jobs, jobsLoading,
  shops, shopsLoading,
  listed, listedLoading,
  requested, requestedLoading,
  mpTab, onMpTabChange,
}: LandingViewProps) {
  return (
    <div className="landing-page">
      <AppHeader />
      <LandingHero />
      <LandingJobs jobs={jobs} isLoading={jobsLoading} />
      <LandingShops shops={shops} isLoading={shopsLoading} />
      <LandingMarketplace
        listed={listed}
        listedLoading={listedLoading}
        requested={requested}
        requestedLoading={requestedLoading}
        tab={mpTab}
        onTabChange={onMpTabChange}
      />
      <AppFooter />
    </div>
  )
}
