'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { useUpdateProfile } from '@/modules/auth/hooks/useUpdateProfile'
import { uploadToCloudinary } from '@/lib/upload/cloudinary'
import EditProfileView from '@/modules/user/components/EditProfileView'
import toast from 'react-hot-toast'

export default function EditProfilePage() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const { mutate: update, isPending } = useUpdateProfile()

  const [form, setForm] = useState({ name: '', email: '', phoneNumber: '' })
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    if (user) setForm({ name: user.name, email: user.email, phoneNumber: user.phoneNumber ?? '' })
  }, [user])

  const onDrop = useCallback((accepted: File[]) => {
    if (!accepted[0]) return
    const file = accepted[0]
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }, [])

  const handleSubmit = async () => {
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
      { name: form.name, email: form.email, phoneNumber: form.phoneNumber, photo },
      { onSuccess: () => router.push('/account/my-profile') }
    )
  }

  return (
    <EditProfileView
      user={user}
      form={form}
      onFormChange={(k, v) => setForm((f) => ({ ...f, [k]: v }))}
      photoPreview={photoPreview}
      onDrop={onDrop}
      onRemovePhoto={() => { setPhotoFile(null); setPhotoPreview('') }}
      isPending={isPending}
      isUploading={isUploading}
      onSubmit={handleSubmit}
    />
  )
}
