'use server'

import { cookies } from 'next/headers'
import { validate } from '../lib/validate'
import { createListedProduct } from '../services/listedProduct.service'
import { createListedProductSchema } from '../validators/listedProduct.validator'
import type { IListedProduct } from '../types/backend.types'

export async function createListedProductAction(
  formData: FormData
): Promise<{ success: boolean; error?: string; product?: IListedProduct }> {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('accessToken')?.value
    if (!accessToken) return { success: false, error: 'Not authenticated' }

    const jwt = await import('jsonwebtoken')
    const env = await import('../lib/env')
    const decoded = jwt.default.verify(accessToken, env.env.JWT_ACCESS_SECRET) as { id: string }

    const raw = {
      productName: formData.get('productName'),
      images: formData.getAll('images'),
      category: formData.get('category'),
      condition: formData.get('condition'),
      price: formData.get('price'),
      isNegotiable: formData.get('isNegotiable') === 'true',
      description: formData.get('description'),
      yearUsed: Number(formData.get('yearUsed')),
      contactDetails: {
        phoneNo: formData.get('contactDetails.phoneNo'),
        email: formData.get('contactDetails.email'),
      },
      isAvailable: formData.get('isAvailable') !== 'false',
    }

    const data = validate(createListedProductSchema, raw)
    const product = await createListedProduct(data, decoded.id)
    return { success: true, product }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to create listing' }
  }
}
