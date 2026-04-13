'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { useUpdateProfile } from '@/modules/auth/hooks/useUpdateProfile'
import { compressImage } from '@/lib/upload/compress'
import EditProfileView from '@/modules/user/components/EditProfileView'

export default function EditProfilePage() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const { mutate: update, isPending } = useUpdateProfile()

  const [form, setForm] = useState({ name: '', email: '', phoneNumber: '' })
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [photoBase64, setPhotoBase64] = useState('')

  useEffect(() => {
    if (user) setForm({ name: user.name, email: user.email, phoneNumber: user.phoneNumber ?? '' })
  }, [user])

  const onDrop = useCallback(async (accepted: File[]) => {
    if (!accepted[0]) return
    const file = accepted[0]
    setPhotoPreview(URL.createObjectURL(file))
    setPhotoFile(file)
    setPhotoBase64(await compressImage(file))
  }, [])

  const handleSubmit = () => {
    // If no new photo selected, keep the existing one
    const photo = photoBase64 || user?.photo || ''
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
      onRemovePhoto={() => { setPhotoFile(null); setPhotoPreview(''); setPhotoBase64('') }}
      isPending={isPending}
      onSubmit={handleSubmit}
    />
  )
}
