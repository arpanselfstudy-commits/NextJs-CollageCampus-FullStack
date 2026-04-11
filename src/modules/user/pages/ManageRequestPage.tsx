'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { useRequestedProduct, useUpdateRequestedProduct, useDeleteRequestedProduct } from '@/modules/marketplace/hooks/useRequestedProducts'
import ManageRequestView from '@/modules/user/components/ManageRequestView'

export default function ManageRequestPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const user = useAuthStore((s) => s.user)

  const { data: request, isLoading } = useRequestedProduct(id)
  const { mutate: update, isPending: updating } = useUpdateRequestedProduct(id)
  const { mutate: remove, isPending: deleting } = useDeleteRequestedProduct()

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    name: '', category: '', priceFrom: 0, priceTo: 0,
    isNegotiable: false, isFulfilled: false, description: '', email: '', phoneNo: '',
  })

  useEffect(() => {
    if (request) setForm({
      name: request.name, category: request.category,
      priceFrom: request.price.from, priceTo: request.price.to,
      isNegotiable: request.isNegotiable, isFulfilled: request.isFulfilled,
      description: request.description,
      email: request.contactDetails.email, phoneNo: request.contactDetails.phoneNo,
    })
  }, [request])

  const buildPayload = (overrides?: Partial<typeof form>) => {
    const f = { ...form, ...overrides }
    return {
      user: user!._id, name: f.name, images: request!.images, category: f.category,
      price: { from: f.priceFrom, to: f.priceTo }, isNegotiable: f.isNegotiable,
      description: f.description, contactDetails: { email: f.email, phoneNo: f.phoneNo },
      isFulfilled: f.isFulfilled,
    }
  }

  const handleSave = () => {
    if (!user || !request) return
    update(buildPayload(), { onSuccess: () => setEditing(false) })
  }

  const handleToggle = (key: 'isFulfilled' | 'isNegotiable', val: boolean) => {
    if (!user || !request) return
    setForm((f) => ({ ...f, [key]: val }))
    update(buildPayload({ [key]: val }))
  }

  const handleDelete = () => {
    if (!id) return
    remove(id, { onSuccess: () => router.push('/account/my-profile') })
  }

  return (
    <ManageRequestView
      request={request}
      isLoading={isLoading}
      editing={editing}
      onToggleEditing={() => setEditing((e) => !e)}
      form={form}
      onFormChange={(k, v) => setForm((f) => ({ ...f, [k]: v }))}
      onSave={handleSave}
      onCancelEdit={() => setEditing(false)}
      onToggle={handleToggle}
      onDelete={handleDelete}
      updating={updating}
      deleting={deleting}
    />
  )
}
