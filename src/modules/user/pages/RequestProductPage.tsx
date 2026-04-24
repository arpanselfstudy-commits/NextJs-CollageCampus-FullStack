'use client'

import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { useCreateRequestedProduct } from '@/modules/marketplace/hooks/useRequestedProducts'
import { useImageUpload } from '@/modules/user/hooks/useImageUpload'
import RequestProductView from '@/modules/user/components/RequestProductView'
import { useRequestProductForm } from '@/modules/user/hooks/useRequestProductForm'

export default function RequestProductPage() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const { mutate: create, isPending } = useCreateRequestedProduct()

  const { register, handleSubmit: rhfHandleSubmit, formState: { errors }, watch, setValue } = useRequestProductForm()
  const { images, isUploading, onDrop, removeImage, uploadAll } = useImageUpload(5)

  const handleSubmit = rhfHandleSubmit(async (data) => {
    if (!user || images.length === 0) return
    const uploadedUrls = await uploadAll()
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
