'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { useCreateRequestedProduct } from '@/modules/marketplace/hooks/useRequestedProducts'
import { compressImage } from '@/lib/upload/compress'
import RequestProductView from '@/modules/user/components/RequestProductView'
import type { ListedProductCategory } from '@/modules/marketplace/types'

export default function RequestProductPage() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const { mutate: create, isPending } = useCreateRequestedProduct()

  const [images, setImages] = useState<{ file: File; preview: string }[]>([])
  const [form, setForm] = useState({
    name: '', category: 'ELECTRONICS' as ListedProductCategory,
    priceFrom: 0, priceTo: 0, isNegotiable: false,
    description: '', email: '', phoneNo: '',
  })

  const onDrop = useCallback((accepted: File[]) => {
    const newImgs = accepted.slice(0, 5 - images.length).map((file) => ({
      file, preview: URL.createObjectURL(file),
    }))
    setImages((prev) => [...prev, ...newImgs])
  }, [images])

  const removeImage = (i: number) => {
    setImages((prev) => { URL.revokeObjectURL(prev[i].preview); return prev.filter((_, idx) => idx !== i) })
  }

  const handleSubmit = async () => {
    if (!user || images.length === 0) return
    const base64Images = await Promise.all(images.map((img) => compressImage(img.file)))
    create({
      user: user._id, name: form.name, images: base64Images,
      category: form.category,
      price: { from: form.priceFrom, to: form.priceTo },
      isNegotiable: form.isNegotiable, description: form.description,
      contactDetails: { email: form.email, phoneNo: form.phoneNo },
      isFulfilled: false,
    }, { onSuccess: () => router.push('/account/my-profile') })
  }

  return (
    <RequestProductView
      form={form}
      onFormChange={(k, v) => setForm((f) => ({ ...f, [k]: v }))}
      images={images}
      onDrop={onDrop}
      onRemoveImage={removeImage}
      isPending={isPending}
      onSubmit={handleSubmit}
    />
  )
}
