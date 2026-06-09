export interface AuthUser {
  userId: string
  username: string
  email: string
  firstName: string
  lastName: string
  role: 'admin' | 'user' | 'viewer'
  isVerified: boolean
}

export interface LoginCredentials {
  identifier: string
  password: string
}

export interface RegisterData {
  username: string
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
