export type Gender = 'male' | 'female' | 'other'
export type MaritalStatus = 'single' | 'married' | 'widowed' | 'divorced'

export interface Child {
  name: string
  dateOfBirth?: string
  gender?: Gender
  phone?: string
}

export interface Education {
  level: string
  institution?: string
  yearCompleted?: number
  notes?: string
}

export interface Person {
  _id: string
  // Basic info
  firstName: string
  lastName: string
  gender?: Gender
  dateOfBirth?: string
  age?: number // Computed age from date of birth
  phone?: string
  email?: string
  // Location
  village?: string
  ward?: string
  address?: string
  // Parent details
  fatherName?: string
  fatherPhone?: string
  fatherId?: string
  motherName?: string
  motherPhone?: string
  motherId?: string
  // Own family (if married)
  maritalStatus?: MaritalStatus
  spouseName?: string
  spousePhone?: string
  spouseId?: string
  marriageYear?: number
  numberOfChildren?: number
  children?: Child[]
  // Education
  education?: Education[]
  // Meta
  notes?: string
  isAlive: boolean
  isActive: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface PersonFormData {
  firstName: string
  lastName: string
  gender?: Gender
  dateOfBirth?: string
  age?: number // Computed age from date of birth
  phone?: string
  email?: string
  village?: string
  ward?: string
  address?: string
  fatherName?: string
  fatherPhone?: string
  fatherId?: string
  motherName?: string
  motherPhone?: string
  motherId?: string
  maritalStatus?: MaritalStatus
  spouseName?: string
  spousePhone?: string
  spouseId?: string
  marriageYear?: number
  numberOfChildren?: number
  children?: Child[]
  education?: Education[]
  notes?: string
  isAlive?: boolean
  isActive?: boolean
}
