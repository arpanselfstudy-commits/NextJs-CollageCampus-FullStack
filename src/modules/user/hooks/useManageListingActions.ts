'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { useUpdateListedProduct, useDeleteListedProduct } from '@/modules/marketplace/hooks/useListedProducts'
import type { ListedProduct } from '@/modules/marketplace/types'
import type { ManageListingForm } from '@/modules/user/types'
import type { UseFormWatch, UseFormSetValue } from 'react-hook-form'

interface Options {
  id: string
  product: ListedProduct | undefined
  watch: UseFormWatch<ManageListingForm>
  setValue: UseFormSetValue<ManageListingForm>
}

export function useManageListingActions({ id, product, watch, setValue }: Options) {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const { mutate: update, isPending: updating } = useUpdateListedProduct(id)
  const { mutate: remove, isPending: deleting } = useDeleteListedProduct()

  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const buildPayload = (data: ManageListingForm) => ({
    user: user!._id, productName: data.productName, images: product!.images,
    category: data.category, condition: data.condition, price: data.price,
    isNegotiable: data.isNegotiable, description: data.description,
    yearUsed: data.yearUsed, contactDetails: { email: data.email, phoneNo: data.phoneNo },
    isAvailable: data.isAvailable,
  })

  const handleSave = (data: ManageListingForm) => {
    if (!user || !product) return
    update(buildPayload(data), { onSuccess: () => setEditing(false) })
  }

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

  return {
    editing, setEditing,
    confirmDelete, setConfirmDelete,
    updating, deleting,
    handleSave, handleToggleAvailable, handleDelete,
  }
}
