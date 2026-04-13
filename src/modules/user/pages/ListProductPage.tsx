'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { useCreateListedProduct } from '@/modules/marketplace/hooks/useListedProducts'
import { uploadToCloudinary } from '@/lib/upload/cloudinary'
import ListProductView from '@/modules/user/components/ListProductView'
import { useListProductForm } from '@/modules/user/hooks/useListProductForm'
import toast from 'react-hot-toast'

export default function ListProductPage() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const { mutate: create, isPending } = useCreateListedProduct()

  const { register, handleSubmit: rhfHandleSubmit, formState: { errors }, watch, setValue } = useListProductForm()

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
      user: user._id, productName: data.productName, images: uploadedUrls,
      category: data.category, condition: data.condition, price: data.price,
      isNegotiable: data.isNegotiable, description: data.description,
      yearUsed: data.yearUsed,
      contactDetails: { email: data.email, phoneNo: data.phoneNo },
      isAvailable: true,
    }, { onSuccess: () => router.push('/account/my-profile') })
  })

  return (
    <ListProductView
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
