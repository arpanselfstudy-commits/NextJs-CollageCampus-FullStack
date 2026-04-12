import { z } from 'zod'

export const createCmsSchema = z.object({
  type: z.string().min(1),
  title: z.string().min(1),
  content: z.string().min(1),
  isActive: z.boolean().optional(),
})
export const updateCmsSchema = createCmsSchema.partial()
