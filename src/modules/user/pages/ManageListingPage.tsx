'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { useListedProduct, useUpdateListedProduct, useDeleteListedProduct } from '@/modules/marketplace/hooks/useListedProducts'
import ManageListingView from '@/modules/user/components/ManageListingView'
import type { ListedProductCategory, ListedProductCondition } from '@/modules/marketplace/types'

export default function ManageListingPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const user = useAuthStore((s) => s.user)

  const { data: product, isLoading } = useListedProduct(id)
  const { mutate: update, isPending: updating } = useUpdateListedProduct(id)
  const { mutate: remove, isPending: deleting } = useDeleteListedProduct()

  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [form, setForm] = useState({
    productName: '', category: 'ELECTRONICS' as ListedProductCategory,
    price: '', description: '', condition: 'NEW' as ListedProductCondition,
    yearUsed: 0, isNegotiable: false, isAvailable: true, email: '', phoneNo: '',
  })

  useEffect(() => {
    if (product) setForm({
      productName: product.productName, category: product.category as ListedProductCategory,
      price: product.price, description: product.description,
      condition: product.condition as ListedProductCondition,
      yearUsed: product.yearUsed, isNegotiable: product.isNegotiable,
      isAvailable: product.isAvailable,
      email: product.contactDetails.email, phoneNo: product.contactDetails.phoneNo,
    })
  }, [product])

  const buildPayload = (overrides?: Partial<typeof form>) => {
    const f = { ...form, ...overrides }
    return {
      user: user!._id, productName: f.productName, images: product!.images,
      category: f.category, condition: f.condition, price: f.price,
      isNegotiable: f.isNegotiable, description: f.description,
      yearUsed: f.yearUsed, contactDetails: { email: f.email, phoneNo: f.phoneNo },
      isAvailable: f.isAvailable,
    }
  }

  const handleSave = () => {
    if (!user || !product) return
    update(buildPayload(), { onSuccess: () => setEditing(false) })
  }

  const handleToggleAvailable = (val: boolean) => {
    if (!user || !product) return
    setForm((f) => ({ ...f, isAvailable: val }))
    update(buildPayload({ isAvailable: val }))
  }

  const handleDelete = () => {
    if (!id) return
    remove(id, { onSuccess: () => router.push('/account/my-profile') })
  }

  return (
    <ManageListingView
      product={product}
      isLoading={isLoading}
      editing={editing}
      onToggleEditing={() => setEditing((e) => !e)}
      form={form}
      onFormChange={(k, v) => setForm((f) => ({ ...f, [k]: v }))}
      onSave={handleSave}
      onCancelEdit={() => setEditing(false)}
      onToggleAvailable={handleToggleAvailable}
      onDelete={() => setConfirmDelete(true)}
      onConfirmDelete={handleDelete}
      onCancelDelete={() => setConfirmDelete(false)}
      confirmDelete={confirmDelete}
      updating={updating}
      deleting={deleting}
    />
  )
}
