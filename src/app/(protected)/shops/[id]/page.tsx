import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { makeServerQueryClient } from '@/lib/react-query/serverQueryClient'
import { queryKeys } from '@/lib/react-query/queryKeys'
import ShopDetailPage from '@/modules/shops/pages/ShopDetailPage'

export const revalidate = 300

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  try {
    const { id } = await params
    const res = await fetch(`${BASE_URL}/api/shops/${id}`)
    if (!res.ok) return { title: 'Shop Not Found' }
    const json = await res.json()
    const shop = json.data
    return {
      title: shop.name,
      description: shop.type ?? shop.location,
      openGraph: {
        title: shop.name,
        description: shop.type ?? shop.location,
      },
    }
  } catch {
    return { title: 'Shop Not Found' }
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const qc = makeServerQueryClient()

  const res = await fetch(`${BASE_URL}/api/shops/${id}`)
  if (res.status === 404) notFound()

  if (res.ok) {
    const json = await res.json()
    qc.setQueryData(queryKeys.shops.byId(id), json.data)
  }

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <ShopDetailPage />
    </HydrationBoundary>
  )
}
