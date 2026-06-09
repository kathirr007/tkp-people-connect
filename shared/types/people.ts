export interface PersonAddress {
  street?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
}

export interface Person {
  _id: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  address?: PersonAddress
  organization?: string
  designation?: string
  department?: string
  notes?: string
  tags?: string[]
  isActive: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface PersonFormData {
  firstName: string
  lastName: string
  email?: string
  phone?: string
  address?: PersonAddress
  organization?: string
  designation?: string
  department?: string
  notes?: string
  tags?: string[]
  isActive?: boolean
}
