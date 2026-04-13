'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { useUpdateProfile } from '@/modules/auth/hooks/useUpdateProfile'
import { uploadToCloudinary } from '@/lib/upload/cloudinary'
import EditProfileView from '@/modules/user/components/EditProfileView'
import { useEditProfileForm } from '@/modules/user/hooks/useEditProfileForm'
import toast from 'react-hot-toast'

export default function EditProfilePage() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const { mutate: update, isPending } = useUpdateProfile()

  const { register, handleSubmit: rhfHandleSubmit, formState: { errors, isSubmitting } } = useEditProfileForm()

  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback((accepted: File[]) => {
    if (!accepted[0]) return
    const file = accepted[0]
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }, [])

  const handleSubmit = rhfHandleSubmit(async (data) => {
    let photo = user?.photo || ''

    if (photoFile) {
      setIsUploading(true)
      try {
        photo = await uploadToCloudinary(photoFile)
      } catch (err) {
        console.error('Image upload failed:', err)
        toast.error('Image upload failed. Please try again.')
        return
      } finally {
        setIsUploading(false)
      }
    }

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
      onRemovePhoto={() => { setPhotoFile(null); setPhotoPreview('') }}
      isPending={isPending || isSubmitting}
      isUploading={isUploading}
      onSubmit={handleSubmit}
    />
  )
}
