'use client'

import { useParams } from 'next/navigation'
import { useShop } from '../hooks/useShops'
import ShopDetailView from '@/modules/shops/components/ShopDetailView'

export default function ShopDetailPage() {
  const params = useParams()
  const id = params?.id as string
  const { data: shop, isLoading } = useShop(id)

  return <ShopDetailView shop={shop} isLoading={isLoading} />
}
