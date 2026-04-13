import * as yup from 'yup'

// Login
export const loginSchema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
})

export type LoginFormValues = yup.InferType<typeof loginSchema>

// Register
export const registerSchema = yup.object({
  name: yup.string().min(2, 'Name must be at least 2 characters').required('Name is required'),
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
})

export type RegisterFormValues = yup.InferType<typeof registerSchema>

// Forgot Password
export const forgotPasswordSchema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
})

export type ForgotPasswordFormValues = yup.InferType<typeof forgotPasswordSchema>

// Reset Password
export const resetPasswordSchema = yup.object({
  password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
})

export type ResetPasswordFormValues = yup.InferType<typeof resetPasswordSchema>

// Update Profile
export const updateProfileSchema = yup.object({
  name: yup.string().min(2, 'Name must be at least 2 characters').required('Name is required'),
  email: yup.string().email('Enter a valid email').required('Email is required'),
  phoneNumber: yup
    .string()
    .matches(/^\d{7,}$/, 'Phone number must be at least 7 digits')
    .required('Phone number is required'),
})

export type UpdateProfileFormValues = yup.InferType<typeof updateProfileSchema>
