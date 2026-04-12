'use server'

import { cookies } from 'next/headers'
import { validate } from '../lib/validate'
import { createRequestedProduct } from '../services/requestedProduct.service'
import { createRequestedProductSchema } from '../validators/requestedProduct.validator'
import type { IRequestedProduct } from '../types/backend.types'

export async function createRequestedProductAction(
  formData: FormData
): Promise<{ success: boolean; error?: string; request?: IRequestedProduct }> {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('accessToken')?.value
    if (!accessToken) return { success: false, error: 'Not authenticated' }

    const jwt = await import('jsonwebtoken')
    const env = await import('../lib/env')
    const decoded = jwt.default.verify(accessToken, env.env.JWT_ACCESS_SECRET) as { id: string }

    const raw = {
      name: formData.get('name'),
      images: formData.getAll('images').length > 0 ? formData.getAll('images') : undefined,
      category: formData.get('category'),
      price: {
        from: Number(formData.get('price.from')),
        to: Number(formData.get('price.to')),
      },
      isNegotiable: formData.get('isNegotiable') === 'true',
      description: formData.get('description'),
      contactDetails: {
        phoneNo: formData.get('contactDetails.phoneNo'),
        email: formData.get('contactDetails.email'),
      },
      isFulfilled: formData.get('isFulfilled') === 'true',
    }

    const data = validate(createRequestedProductSchema, raw)
    const request = await createRequestedProduct(data, decoded.id)
    return { success: true, request }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to create request' }
  }
}
