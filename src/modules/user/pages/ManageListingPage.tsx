'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { useListedProduct, useUpdateListedProduct, useDeleteListedProduct } from '@/modules/marketplace/hooks/useListedProducts'
import ManageListingView from '@/modules/user/components/ManageListingView'
import { useManageListingForm } from '@/modules/user/hooks/useManageListingForm'
import type { ManageListingForm } from '@/modules/user/types'

export default function ManageListingPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const user = useAuthStore((s) => s.user)

  const { data: product, isLoading } = useListedProduct(id)
  const { mutate: update, isPending: updating } = useUpdateListedProduct(id)
  const { mutate: remove, isPending: deleting } = useDeleteListedProduct()

  const { register, handleSubmit: rhfHandleSubmit, formState: { errors }, watch, setValue } = useManageListingForm(product)

  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const buildPayload = (data: ManageListingForm) => ({
    user: user!._id, productName: data.productName, images: product!.images,
    category: data.category, condition: data.condition, price: data.price,
    isNegotiable: data.isNegotiable, description: data.description,
    yearUsed: data.yearUsed, contactDetails: { email: data.email, phoneNo: data.phoneNo },
    isAvailable: data.isAvailable,
  })

  const handleSave = rhfHandleSubmit((data) => {
    if (!user || !product) return
    update(buildPayload(data), { onSuccess: () => setEditing(false) })
  })

  const handleToggleAvailable = (val: boolean) => {
    if (!user || !product) return
    setValue('isAvailable', val)
    const current = watch()
    update(buildPayload({ ...current, isAvailable: val }))
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
      register={register}
      errors={errors}
      watch={watch}
      setValue={setValue}
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
