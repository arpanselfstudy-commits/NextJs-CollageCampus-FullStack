'use client'

import { useParams } from 'next/navigation'
import { useRequestedProduct } from '@/modules/marketplace/hooks/useRequestedProducts'
import ManageRequestView from '@/modules/user/components/ManageRequestView'
import { useManageRequestForm } from '@/modules/user/hooks/useManageRequestForm'
import { useManageRequestActions } from '@/modules/user/hooks/useManageRequestActions'

export default function ManageRequestPage() {
  const params = useParams()
  const id = params?.id as string

  const { data: request, isLoading } = useRequestedProduct(id)
  const { register, handleSubmit: rhfHandleSubmit, formState: { errors }, watch, setValue } = useManageRequestForm(request)

  const {
    editing, setEditing,
    confirmDelete, setConfirmDelete,
    updating, deleting,
    handleSave, handleToggle, handleDelete,
  } = useManageRequestActions({ id, request, watch, setValue })

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
      onSave={rhfHandleSubmit(handleSave)}
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
