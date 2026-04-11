import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { makeServerQueryClient } from '@/lib/react-query/serverQueryClient'
import { queryKeys } from '@/lib/react-query/queryKeys'
import LandingPage from '@/modules/landing/pages/LandingPage'

export const revalidate = 60

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'

async function fetchJson(path: string) {
  const res = await fetch(`${BASE_URL}${path}`)
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`)
  const json = await res.json()
  return json.data
}

export default async function Page() {
  const qc = makeServerQueryClient()

  await Promise.allSettled([
    qc.prefetchQuery({
      queryKey: queryKeys.jobs.all({ limit: 6 }),
      queryFn: () => fetchJson('/api/jobs?limit=6'),
    }),
    qc.prefetchQuery({
      queryKey: queryKeys.shops.all({ limit: 4 }),
      queryFn: () => fetchJson('/api/shops?limit=4'),
    }),
    qc.prefetchQuery({
      queryKey: queryKeys.listedProducts.all({ limit: 8 }),
      queryFn: () => fetchJson('/api/listed-products?limit=8'),
    }),
    qc.prefetchQuery({
      queryKey: queryKeys.requestedProducts.all({ limit: 8 }),
      queryFn: () => fetchJson('/api/requested-products?limit=8'),
    }),
  ])

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <LandingPage />
    </HydrationBoundary>
  )
}
