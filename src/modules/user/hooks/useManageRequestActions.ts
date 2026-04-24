'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { useUpdateRequestedProduct, useDeleteRequestedProduct } from '@/modules/marketplace/hooks/useRequestedProducts'
import type { RequestedProduct } from '@/modules/marketplace/types'
import type { ManageRequestForm } from '@/modules/user/types'
import type { UseFormWatch, UseFormSetValue } from 'react-hook-form'

interface Options {
  id: string
  request: RequestedProduct | undefined
  watch: UseFormWatch<ManageRequestForm>
  setValue: UseFormSetValue<ManageRequestForm>
}

export function useManageRequestActions({ id, request, watch, setValue }: Options) {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const { mutate: update, isPending: updating } = useUpdateRequestedProduct(id)
  const { mutate: remove, isPending: deleting } = useDeleteRequestedProduct()

  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const buildPayload = (data: ManageRequestForm) => ({
    user: user!._id, name: data.name, images: request!.images, category: data.category,
    price: { from: data.priceFrom, to: data.priceTo }, isNegotiable: data.isNegotiable,
    description: data.description, contactDetails: { email: data.email, phoneNo: data.phoneNo },
    isFulfilled: data.isFulfilled,
  })

  const handleSave = (data: ManageRequestForm) => {
    if (!user || !request) return
    update(buildPayload(data), { onSuccess: () => setEditing(false) })
  }

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

  return {
    editing, setEditing,
    confirmDelete, setConfirmDelete,
    updating, deleting,
    handleSave, handleToggle, handleDelete,
  }
}
