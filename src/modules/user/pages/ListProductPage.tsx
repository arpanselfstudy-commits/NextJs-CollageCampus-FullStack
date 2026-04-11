'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { useCreateListedProduct } from '@/modules/marketplace/hooks/useListedProducts'
import { compressImage } from '@/lib/upload/compress'
import ListProductView from '@/modules/user/components/ListProductView'
import type { ListedProductCategory, ListedProductCondition } from '@/modules/marketplace/types'

export default function ListProductPage() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const { mutate: create, isPending } = useCreateListedProduct()

  const [images, setImages] = useState<{ file: File; preview: string }[]>([])
  const [form, setForm] = useState({
    productName: '', category: 'ELECTRONICS' as ListedProductCategory,
    price: '', description: '', condition: 'NEW' as ListedProductCondition,
    yearUsed: 0, isNegotiable: false, email: '', phoneNo: '',
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
      user: user._id, productName: form.productName, images: base64Images,
      category: form.category, condition: form.condition, price: form.price,
      isNegotiable: form.isNegotiable, description: form.description,
      yearUsed: form.yearUsed,
      contactDetails: { email: form.email, phoneNo: form.phoneNo },
      isAvailable: true,
    }, { onSuccess: () => router.push('/account/my-profile') })
  }

  return (
    <ListProductView
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
