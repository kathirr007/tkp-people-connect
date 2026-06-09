export interface AuthUser {
  userId: string
  email: string
  firstName: string
  lastName: string
  role: 'admin' | 'user' | 'viewer'
  isVerified: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
}

export interface ForgotPasswordData {
  email: string
}

export interface ResetPasswordData {
  token: string
  password: string
}
