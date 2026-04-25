import type { ListedProductCategory, ListedProductCondition } from '@/modules/marketplace/types'

// ── Core user entity ─────────────────────────────────────
export interface User {
  _id: string
  name: string
  email: string
  phoneNumber?: string
  photo?: string
  role: UserRole
  createdAt?: string
  updatedAt?: string
}

export type UserRole = 'admin' | 'user' | 'USER' | 'ADMIN'

// ── API payloads ─────────────────────────────────────────

/** Payload for updating a user's profile */
export interface UpdateProfilePayload {
  name: string
  email: string
  phoneNumber?: string
  photo?: string          // base64-encoded image
}

// ── Edit profile form state ──────────────────────────────
export interface EditProfileForm {
  name: string
  email: string
  phoneNumber: string
}

// ── List product form state ──────────────────────────────
export interface ListProductForm {
  productName: string
  category: ListedProductCategory
  price: string
  description: string
  condition: ListedProductCondition
  yearUsed: number
  isNegotiable: boolean
  email: string
  phoneNo: string
}

// ── Request product form state ───────────────────────────
export interface RequestProductForm {
  name: string
  category: ListedProductCategory
  priceFrom: number
  priceTo: number
  isNegotiable: boolean
  description: string
  email: string
  phoneNo: string
}

// ── Manage listing form state ────────────────────────────
export interface ManageListingForm {
  productName: string
  category: ListedProductCategory
  price: string
  description: string
  condition: ListedProductCondition
  yearUsed: number
  isNegotiable: boolean
  isAvailable: boolean
  email: string
  phoneNo: string
}

// ── Manage request form state ────────────────────────────
export interface ManageRequestForm {
  name: string
  category: ListedProductCategory
  priceFrom: number
  priceTo: number
  isNegotiable: boolean
  isFulfilled: boolean
  description: string
  email: string
  phoneNo: string
}

// ── Image upload helper ──────────────────────────────────
export interface ImagePreview {
  file: File
  preview: string   // object URL from URL.createObjectURL
}

// ── Profile tab ──────────────────────────────────────────
export type ProfileTab = 'listings' | 'requests'

// ── API response wrappers ────────────────────────────────
export interface UsersResponse {
  users: User[]
  total: number
}

export interface UserResponse {
  user: User
}
