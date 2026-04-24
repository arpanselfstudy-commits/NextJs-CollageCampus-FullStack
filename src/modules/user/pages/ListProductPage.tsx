'use client'

import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { useCreateListedProduct } from '@/modules/marketplace/hooks/useListedProducts'
import { useImageUpload } from '@/modules/user/hooks/useImageUpload'
import ListProductView from '@/modules/user/components/ListProductView'
import { useListProductForm } from '@/modules/user/hooks/useListProductForm'

export default function ListProductPage() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const { mutate: create, isPending } = useCreateListedProduct()

  const { register, handleSubmit: rhfHandleSubmit, formState: { errors }, watch, setValue } = useListProductForm()
  const { images, isUploading, onDrop, removeImage, uploadAll } = useImageUpload(5)

  const handleSubmit = rhfHandleSubmit(async (data) => {
    if (!user || images.length === 0) return
    const uploadedUrls = await uploadAll()
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
