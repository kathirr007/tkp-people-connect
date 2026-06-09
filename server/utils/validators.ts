import { z } from 'zod'

export const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be at most 50 characters')
    .regex(/^[a-zA-Z0-9_.-]+$/, 'Username can only contain letters, numbers, dots, hyphens, and underscores'),
  email: z.string().trim().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
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
    .regex(/[0-9]/, 'Must contain a number'),
})

export const personSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().max(20).optional().or(z.literal('')),
  address: z
    .object({
      street: z.string().max(200).optional().or(z.literal('')),
      city: z.string().max(100).optional().or(z.literal('')),
      state: z.string().max(100).optional().or(z.literal('')),
      zipCode: z.string().max(20).optional().or(z.literal('')),
      country: z.string().max(100).optional().or(z.literal('')),
    })
    .optional(),
  organization: z.string().max(200).optional().or(z.literal('')),
  designation: z.string().max(200).optional().or(z.literal('')),
  department: z.string().max(200).optional().or(z.literal('')),
  notes: z.string().max(2000).optional().or(z.literal('')),
  tags: z.array(z.string().max(50)).max(20).optional(),
  isActive: z.boolean().optional(),
})

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  organization: z.string().optional(),
  isActive: z
    .string()
    .optional()
    .transform(val => (val === 'true' ? true : val === 'false' ? false : undefined)),
})

export const updateRoleSchema = z.object({
  role: z.enum(['admin', 'user', 'viewer']),
})
