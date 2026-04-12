import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { makeServerQueryClient } from '@/lib/react-query/serverQueryClient'
import { queryKeys } from '@/lib/react-query/queryKeys'
import ShopDetailPage from '@/modules/shops/pages/ShopDetailPage'
import { getShopById } from '@/backend/queries/shop.queries'

export const revalidate = 300

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  try {
    const { id } = await params
    const shop = await getShopById(id)
    return {
      title: shop.name,
      description: shop.type ?? shop.location,
      openGraph: { title: shop.name, description: shop.type ?? shop.location },
    }
  } catch {
    return { title: 'Shop Not Found' }
  }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const qc = makeServerQueryClient()

  try {
    const shop = await getShopById(id)
    qc.setQueryData(queryKeys.shops.byId(id), JSON.parse(JSON.stringify(shop)))
  } catch {
    notFound()
  }

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <ShopDetailPage />
    </HydrationBoundary>
  )
}
