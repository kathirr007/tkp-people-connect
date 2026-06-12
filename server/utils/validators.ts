import { z } from 'zod'

export const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be at most 50 characters')
    .regex(/^[\w.-]+$/, 'Username can only contain letters, numbers, dots, hyphens, and underscores'),
  email: z.string().trim().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/\d/, 'Password must contain at least one number'),
  firstName: z.string().trim().min(2, 'First name must be at least 2 characters').max(100),
  lastName: z.string().trim().min(2, 'Last name must be at least 2 characters').max(100),
})

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/\d/, 'Must contain a number'),
})

export const personSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  gender: z.enum(['male', 'female', 'other']).optional(),
  dateOfBirth: z.string().optional().or(z.literal('')),
  age: z.number().int().min(0).optional(), // Computed age field
  phone: z.string().max(20).optional().or(z.literal('')),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  village: z.string().max(100).optional().or(z.literal('')),
  ward: z.string().max(100).optional().or(z.literal('')),
  address: z.string().max(500).optional().or(z.literal('')),
  fatherName: z.string().max(100).optional().or(z.literal('')),
  fatherPhone: z.string().max(20).optional().or(z.literal('')),
  fatherId: z.string().max(36).optional().or(z.literal('')),
  motherName: z.string().max(100).optional().or(z.literal('')),
  motherPhone: z.string().max(20).optional().or(z.literal('')),
  motherId: z.string().max(36).optional().or(z.literal('')),
  maritalStatus: z.enum(['single', 'married', 'widowed', 'divorced']).optional(),
  spouseName: z.string().max(100).optional().or(z.literal('')),
  spousePhone: z.string().max(20).optional().or(z.literal('')),
  spouseId: z.string().max(36).optional().or(z.literal('')),
  marriageYear: z.number().int().min(1900).max(2100).optional().nullable(),
  numberOfChildren: z.number().int().min(0).optional().nullable(),
  notes: z.string().max(2000).optional().or(z.literal('')),
  isAlive: z.boolean().optional(),
  isActive: z.boolean().optional(),
})

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  village: z.string().optional(),
  isActive: z
    .string()
    .optional()
    .transform(val => (val === 'true' ? true : val === 'false' ? false : undefined)),
})

export const youthEducationSchema = z.object({
  level: z.string().min(1, 'Education level is required'),
  institution: z.string().max(200).optional().or(z.literal('')),
  course: z.string().max(200).optional().or(z.literal('')),
  yearOfStudy: z.number().int().min(1).max(10).optional().nullable(),
  yearCompleted: z.number().int().min(1900).max(2100).optional().nullable(),
  percentage: z.number().min(0).max(100).optional().nullable(),
  notes: z.string().max(500).optional().or(z.literal('')),
})

export const youthAchievementSchema = z.object({
  title: z.string().min(1, 'Achievement title is required').max(200),
  category: z.enum(['sports', 'study', 'extracurricular', 'cultural', 'community', 'other']),
  level: z.enum(['school', 'district', 'state', 'national', 'international']).optional(),
  year: z.number().int().min(1900).max(2100).optional().nullable(),
  description: z.string().max(500).optional().or(z.literal('')),
})

export const youthActivitySchema = z.object({
  name: z.string().min(1, 'Activity name is required').max(100),
  type: z.enum(['sports', 'arts', 'music', 'dance', 'drama', 'volunteering', 'coding', 'other']),
  proficiency: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
  notes: z.string().max(500).optional().or(z.literal('')),
})

export const youthSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  gender: z.enum(['male', 'female', 'other']).optional(),
  dateOfBirth: z.string().optional().or(z.literal('')),
  age: z.number().int().min(0).optional(), // Computed age field
  phone: z.string().max(20).optional().or(z.literal('')),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  village: z.string().max(100).optional().or(z.literal('')),
  ward: z.string().max(100).optional().or(z.literal('')),
  address: z.string().max(500).optional().or(z.literal('')),
  fatherName: z.string().max(100).optional().or(z.literal('')),
  fatherPhone: z.string().max(20).optional().or(z.literal('')),
  motherName: z.string().max(100).optional().or(z.literal('')),
  motherPhone: z.string().max(20).optional().or(z.literal('')),
  currentlyStudying: z.boolean().optional(),
  educationDetails: z.array(youthEducationSchema).optional(),
  activities: z.array(youthActivitySchema).optional(),
  achievements: z.array(youthAchievementSchema).optional(),
  interests: z.string().max(1000).optional().or(z.literal('')),
  careerGoal: z.string().max(255).optional().or(z.literal('')),
  bloodGroup: z.string().max(10).optional().or(z.literal('')),
  notes: z.string().max(2000).optional().or(z.literal('')),
  isActive: z.boolean().optional(),
})

export const updateRoleSchema = z.object({
  role: z.enum(['admin', 'user', 'viewer']),
})
