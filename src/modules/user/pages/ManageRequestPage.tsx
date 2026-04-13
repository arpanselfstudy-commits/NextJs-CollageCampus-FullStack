'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { useRequestedProduct, useUpdateRequestedProduct, useDeleteRequestedProduct } from '@/modules/marketplace/hooks/useRequestedProducts'
import ManageRequestView from '@/modules/user/components/ManageRequestView'
import { useManageRequestForm } from '@/modules/user/hooks/useManageRequestForm'
import type { ManageRequestForm } from '@/modules/user/types'

export default function ManageRequestPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const user = useAuthStore((s) => s.user)

  const { data: request, isLoading } = useRequestedProduct(id)
  const { mutate: update, isPending: updating } = useUpdateRequestedProduct(id)
  const { mutate: remove, isPending: deleting } = useDeleteRequestedProduct()

  const { register, handleSubmit: rhfHandleSubmit, formState: { errors }, watch, setValue } = useManageRequestForm(request)

  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const buildPayload = (data: ManageRequestForm) => ({
    user: user!._id, name: data.name, images: request!.images, category: data.category,
    price: { from: data.priceFrom, to: data.priceTo }, isNegotiable: data.isNegotiable,
    description: data.description, contactDetails: { email: data.email, phoneNo: data.phoneNo },
    isFulfilled: data.isFulfilled,
  })

  const handleSave = rhfHandleSubmit((data) => {
    if (!user || !request) return
    update(buildPayload(data), { onSuccess: () => setEditing(false) })
  })

  const handleToggle = (key: 'isFulfilled' | 'isNegotiable', val: boolean) => {
    if (!user || !request) return
    setValue(key, val)
    const current = watch()
    update(buildPayload({ ...current, [key]: val }))
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
      register={register}
      errors={errors}
      watch={watch}
      setValue={setValue}
      onSave={handleSave}
      onCancelEdit={() => setEditing(false)}
      onToggle={handleToggle}
      onDelete={() => setConfirmDelete(true)}
      onConfirmDelete={handleDelete}
      onCancelDelete={() => setConfirmDelete(false)}
      confirmDelete={confirmDelete}
      updating={updating}
      deleting={deleting}
    />
  )
}
