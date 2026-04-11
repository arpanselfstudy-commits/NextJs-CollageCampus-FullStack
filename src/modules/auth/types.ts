export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  name: string
  email: string
  password: string
}

export interface AuthUser {
  _id: string
  name: string
  email: string
  role: string
  phoneNumber?: string
  photo?: string
  createdAt: string
  updatedAt: string
}

export interface UpdateProfilePayload {
  name: string
  email: string
  phoneNumber: string
  photo: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  setAuth: (user: AuthUser, accessToken: string, refreshToken: string) => void
  clearAuth: () => void
}
