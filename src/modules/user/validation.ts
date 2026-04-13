import * as yup from 'yup'
import { LISTED_CATEGORIES, LISTED_CONDITIONS } from '@/modules/marketplace/types'
import type {
  EditProfileForm,
  ListProductForm,
  RequestProductForm,
  ManageListingForm,
  ManageRequestForm,
} from '@/modules/user/types'

// ── Edit Profile ─────────────────────────────────────────
export const editProfileSchema: yup.ObjectSchema<EditProfileForm> = yup.object({
  name: yup.string().min(2, 'Name must be at least 2 characters').required('Name is required'),
  email: yup.string().email('Invalid email address').required('Email is required'),
  phoneNumber: yup
    .string()
    .matches(/^\d{7,}$/, 'Phone number must be at least 7 digits')
    .required('Phone number is required'),
})

// ── List Product ─────────────────────────────────────────
export const listProductSchema: yup.ObjectSchema<ListProductForm> = yup.object({
  productName: yup
    .string()
    .min(3, 'Product name must be at least 3 characters')
    .required('Product name is required'),
  category: yup
    .mixed<ListProductForm['category']>()
    .oneOf(LISTED_CATEGORIES, 'Invalid category')
    .required('Category is required'),
  price: yup
    .string()
    .required('Price is required')
    .test('price-positive', 'Price must be greater than 0', (value) =>
      value ? parseFloat(value) > 0 : false
    ),
  description: yup
    .string()
    .min(10, 'Description must be at least 10 characters')
    .required('Description is required'),
  condition: yup
    .mixed<ListProductForm['condition']>()
    .oneOf(LISTED_CONDITIONS, 'Invalid condition')
    .required('Condition is required'),
  yearUsed: yup.number().min(0, 'Year used cannot be negative').required('Year used is required'),
  isNegotiable: yup.boolean().required('Negotiable field is required'),
  email: yup.string().email('Invalid email address').required('Email is required'),
  phoneNo: yup
    .string()
    .matches(/^\d{7,}$/, 'Phone number must be at least 7 digits')
    .required('Phone number is required'),
})

// ── Request Product ──────────────────────────────────────
export const requestProductSchema: yup.ObjectSchema<RequestProductForm> = yup.object({
  name: yup
    .string()
    .min(3, 'Name must be at least 3 characters')
    .required('Name is required'),
  category: yup
    .mixed<RequestProductForm['category']>()
    .oneOf(LISTED_CATEGORIES, 'Invalid category')
    .required('Category is required'),
  priceFrom: yup.number().min(0, 'Min price cannot be negative').required('Min price is required'),
  priceTo: yup
    .number()
    .required('Max price is required')
    .test('priceTo-gt-priceFrom', 'Max price must be greater than min price', function (value) {
      return value > this.parent.priceFrom
    }),
  isNegotiable: yup.boolean().required('Negotiable field is required'),
  description: yup
    .string()
    .min(10, 'Description must be at least 10 characters')
    .required('Description is required'),
  email: yup.string().email('Invalid email address').required('Email is required'),
  phoneNo: yup
    .string()
    .matches(/^\d{7,}$/, 'Phone number must be at least 7 digits')
    .required('Phone number is required'),
})

// ── Manage Listing ───────────────────────────────────────
export const manageListingSchema: yup.ObjectSchema<ManageListingForm> = yup.object({
  productName: yup
    .string()
    .min(3, 'Product name must be at least 3 characters')
    .required('Product name is required'),
  category: yup
    .mixed<ManageListingForm['category']>()
    .oneOf(LISTED_CATEGORIES, 'Invalid category')
    .required('Category is required'),
  price: yup
    .string()
    .required('Price is required')
    .test('price-positive', 'Price must be greater than 0', (value) =>
      value ? parseFloat(value) > 0 : false
    ),
  description: yup
    .string()
    .min(10, 'Description must be at least 10 characters')
    .required('Description is required'),
  condition: yup
    .mixed<ManageListingForm['condition']>()
    .oneOf(LISTED_CONDITIONS, 'Invalid condition')
    .required('Condition is required'),
  yearUsed: yup.number().min(0, 'Year used cannot be negative').required('Year used is required'),
  isNegotiable: yup.boolean().required('Negotiable field is required'),
  isAvailable: yup.boolean().required('Availability field is required'),
  email: yup.string().email('Invalid email address').required('Email is required'),
  phoneNo: yup
    .string()
    .matches(/^\d{7,}$/, 'Phone number must be at least 7 digits')
    .required('Phone number is required'),
})

// ── Manage Request ───────────────────────────────────────
export const manageRequestSchema: yup.ObjectSchema<ManageRequestForm> = yup.object({
  name: yup
    .string()
    .min(3, 'Name must be at least 3 characters')
    .required('Name is required'),
  category: yup.string().required('Category is required'),
  priceFrom: yup.number().min(0, 'Min price cannot be negative').required('Min price is required'),
  priceTo: yup
    .number()
    .required('Max price is required')
    .test('priceTo-gt-priceFrom', 'Max price must be greater than min price', function (value) {
      return value > this.parent.priceFrom
    }),
  isNegotiable: yup.boolean().required('Negotiable field is required'),
  isFulfilled: yup.boolean().required('Fulfilled field is required'),
  description: yup
    .string()
    .min(10, 'Description must be at least 10 characters')
    .required('Description is required'),
  email: yup.string().email('Invalid email address').required('Email is required'),
  phoneNo: yup
    .string()
    .matches(/^\d{7,}$/, 'Phone number must be at least 7 digits')
    .required('Phone number is required'),
})
