'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useRequestedProduct } from '../hooks/useRequestedProducts'
import RequestDetailView from '@/modules/marketplace/components/RequestDetailView'

export default function RequestDetailPage() {
  const params = useParams()
  const id = params?.id as string
  const { data: request, isLoading } = useRequestedProduct(id)
  const [showContact, setShowContact] = useState(false)

  return (
    <RequestDetailView
      request={request}
      isLoading={isLoading}
      showContact={showContact}
      onShowContact={() => setShowContact(true)}
      onCloseContact={() => setShowContact(false)}
    />
  )
}
