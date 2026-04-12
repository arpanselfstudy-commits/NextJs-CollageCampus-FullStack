import { cache } from 'react'
import { connectDB } from '../lib/db'
import { getAllCmsPages as getAllCmsPagesService, getCmsByType as getCmsByTypeService } from '../services/cms.service'

export const getAllCmsPages = cache(async () => {
  await connectDB()
  return getAllCmsPagesService()
})

export const getCmsByType = cache(async (type: string) => {
  await connectDB()
  return getCmsByTypeService(type)
})
