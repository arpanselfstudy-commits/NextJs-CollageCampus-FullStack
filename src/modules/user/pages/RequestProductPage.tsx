'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { useCreateRequestedProduct } from '@/modules/marketplace/hooks/useRequestedProducts'
import { uploadToCloudinary } from '@/lib/upload/cloudinary'
import RequestProductView from '@/modules/user/components/RequestProductView'
import { useRequestProductForm } from '@/modules/user/hooks/useRequestProductForm'
import toast from 'react-hot-toast'

export default function RequestProductPage() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const { mutate: create, isPending } = useCreateRequestedProduct()

  const { register, handleSubmit: rhfHandleSubmit, formState: { errors }, watch, setValue } = useRequestProductForm()

  const [images, setImages] = useState<{ file: File; preview: string }[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback((accepted: File[]) => {
    const newImgs = accepted.slice(0, 5 - images.length).map((file) => ({
      file, preview: URL.createObjectURL(file),
    }))
    setImages((prev) => [...prev, ...newImgs])
  }, [images])

  const removeImage = (i: number) => {
    setImages((prev) => { URL.revokeObjectURL(prev[i].preview); return prev.filter((_, idx) => idx !== i) })
  }

  const handleSubmit = rhfHandleSubmit(async (data) => {
    if (!user || images.length === 0) return
    setIsUploading(true)
    let uploadedUrls: string[]
    try {
      uploadedUrls = await Promise.all(images.map((img) => uploadToCloudinary(img.file)))
    } catch (err) {
      toast.error(`Image upload failed: ${err instanceof Error ? err.message : String(err)}`)
      return
    } finally {
      setIsUploading(false)
    }
    create({
      user: user._id, name: data.name, images: uploadedUrls,
      category: data.category,
      price: { from: data.priceFrom, to: data.priceTo },
      isNegotiable: data.isNegotiable, description: data.description,
      contactDetails: { email: data.email, phoneNo: data.phoneNo },
      isFulfilled: false,
    }, { onSuccess: () => router.push('/account/my-profile') })
  })

  return (
    <RequestProductView
      register={register}
      errors={errors}
      watch={watch}
      setValue={setValue}
      images={images}
      onDrop={onDrop}
      onRemoveImage={removeImage}
      isPending={isPending}
      isUploading={isUploading}
      onSubmit={handleSubmit}
    />
  )
}
