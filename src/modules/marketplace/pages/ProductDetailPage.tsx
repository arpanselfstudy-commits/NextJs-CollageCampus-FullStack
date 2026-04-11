'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useListedProduct } from '../hooks/useListedProducts'
import ProductDetailView from '@/modules/marketplace/components/ProductDetailView'

export default function ProductDetailPage() {
  const params = useParams()
  const id = params?.id as string
  const { data: product, isLoading } = useListedProduct(id)
  const [activeImg, setActiveImg] = useState(0)
  const [showContact, setShowContact] = useState(false)

  return (
    <ProductDetailView
      product={product}
      isLoading={isLoading}
      activeImg={activeImg}
      onImgChange={setActiveImg}
      showContact={showContact}
      onShowContact={() => setShowContact(true)}
      onCloseContact={() => setShowContact(false)}
    />
  )
}
