'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { manageRequestSchema } from '@/modules/user/validation'
import type { ManageRequestForm } from '@/modules/user/types'
import type { RequestedProduct } from '@/modules/marketplace/types'

export function useManageRequestForm(request: RequestedProduct | undefined) {
  const { register, handleSubmit, formState, watch, setValue, control, reset } =
    useForm<ManageRequestForm>({
      resolver: yupResolver(manageRequestSchema),
    })

  useEffect(() => {
    if (request)
      reset({
        name: request.name,
        category: request.category,
        priceFrom: request.price.from,
        priceTo: request.price.to,
        isNegotiable: request.isNegotiable,
        isFulfilled: request.isFulfilled,
        description: request.description,
        email: request.contactDetails.email,
        phoneNo: request.contactDetails.phoneNo,
      })
  }, [request, reset])

  return { register, handleSubmit, formState, watch, setValue, control, reset }
}
