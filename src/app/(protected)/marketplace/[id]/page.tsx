import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { makeServerQueryClient } from '@/lib/react-query/serverQueryClient'
import { queryKeys } from '@/lib/react-query/queryKeys'
import ProductDetailPage from '@/modules/marketplace/pages/ProductDetailPage'
import { getListedProductById } from '@/backend/queries/listedProduct.queries'

export const revalidate = 300

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  try {
    const { id } = await params
    const product = await getListedProductById(id)
    return {
      title: product.productName,
      description: product.description?.slice(0, 160),
      openGraph: { title: product.productName, description: product.description?.slice(0, 160) },
    }
  } catch {
    return { title: 'Product Not Found' }
  }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const qc = makeServerQueryClient()

  try {
    const product = await getListedProductById(id)
    qc.setQueryData(queryKeys.listedProducts.byId(id), JSON.parse(JSON.stringify(product)))
  } catch {
    notFound()
  }

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <ProductDetailPage />
    </HydrationBoundary>
  )
}
