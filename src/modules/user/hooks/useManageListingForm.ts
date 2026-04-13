'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { manageListingSchema } from '@/modules/user/validation'
import type { ManageListingForm } from '@/modules/user/types'
import type { ListedProduct, ListedProductCategory, ListedProductCondition } from '@/modules/marketplace/types'

export function useManageListingForm(product: ListedProduct | undefined) {
  const { register, handleSubmit, formState, watch, setValue, control, reset } =
    useForm<ManageListingForm>({
      resolver: yupResolver(manageListingSchema),
    })

  useEffect(() => {
    if (product)
      reset({
        productName: product.productName,
        category: product.category as ListedProductCategory,
        price: product.price,
        description: product.description,
        condition: product.condition as ListedProductCondition,
        yearUsed: product.yearUsed,
        isNegotiable: product.isNegotiable,
        isAvailable: product.isAvailable,
        email: product.contactDetails.email,
        phoneNo: product.contactDetails.phoneNo,
      })
  }, [product, reset])

  return { register, handleSubmit, formState, watch, setValue, control, reset }
}
