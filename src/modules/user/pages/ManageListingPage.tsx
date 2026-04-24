'use client'

import { useParams } from 'next/navigation'
import { useListedProduct } from '@/modules/marketplace/hooks/useListedProducts'
import ManageListingView from '@/modules/user/components/ManageListingView'
import { useManageListingForm } from '@/modules/user/hooks/useManageListingForm'
import { useManageListingActions } from '@/modules/user/hooks/useManageListingActions'

export default function ManageListingPage() {
  const params = useParams()
  const id = params?.id as string

  const { data: product, isLoading } = useListedProduct(id)
  const { register, handleSubmit: rhfHandleSubmit, formState: { errors }, watch, setValue } = useManageListingForm(product)

  const {
    editing, setEditing,
    confirmDelete, setConfirmDelete,
    updating, deleting,
    handleSave, handleToggleAvailable, handleDelete,
  } = useManageListingActions({ id, product, watch, setValue })

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
      onSave={rhfHandleSubmit(handleSave)}
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
