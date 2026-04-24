'use client'

import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { useUpdateProfile } from '@/modules/auth/hooks/useUpdateProfile'
import { useProfilePhotoUpload } from '@/modules/user/hooks/useImageUpload'
import EditProfileView from '@/modules/user/components/EditProfileView'
import { useEditProfileForm } from '@/modules/user/hooks/useEditProfileForm'

export default function EditProfilePage() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const { mutate: update, isPending } = useUpdateProfile()

  const { register, handleSubmit: rhfHandleSubmit, formState: { errors, isSubmitting } } = useEditProfileForm()
  const { photoPreview, isUploading, onDrop, removePhoto, uploadPhoto } = useProfilePhotoUpload()

  const handleSubmit = rhfHandleSubmit(async (data) => {
    const photo = await uploadPhoto(user?.photo || '')
    update(
      { name: data.name, email: data.email, phoneNumber: data.phoneNumber, photo },
      { onSuccess: () => router.push('/account/my-profile') }
    )
  })

  return (
    <EditProfileView
      user={user}
      register={register}
      errors={errors}
      photoPreview={photoPreview}
      onDrop={onDrop}
      onRemovePhoto={removePhoto}
      isPending={isPending || isSubmitting}
      isUploading={isUploading}
      onSubmit={handleSubmit}
    />
  )
}
