export interface ShopTiming {
  isOpen: boolean
  opensAt: string
  closesAt: string
}

export interface Shop {
  _id?: string
  shopId: string
  name: string
  type: string
  location: string
  distance: string
  photo: string
  photos: string[]
  poster: string
  topItems: string[]
  allItems: string[]
  contactDetails: { email: string; phoneNo: string }
  shopTiming: Record<string, ShopTiming>
}

export interface ShopsResponse {
  shops: Shop[]
  pagination: { total: number; page: number; limit: number; pages: number }
}

export interface ShopsParams {
  page?: number
  limit?: number
  search?: string
  distance?: string
  openDay?: string
}
