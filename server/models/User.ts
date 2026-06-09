import { Schema, model } from 'mongoose'
import type { Document } from 'mongoose'

export interface IUser extends Document {
  email: string
  password: string
  firstName: string
  lastName: string
  role: 'admin' | 'user' | 'viewer'
  isVerified: boolean
  verificationToken: string | null
  resetPasswordToken: string | null
  resetPasswordExpires: Date | null
  refreshToken: string | null
  lastLogin: Date | null
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, required: true, select: false },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ['admin', 'user', 'viewer'],
      default: 'viewer',
    },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String, default: null },
    resetPasswordToken: { type: String, default: null, select: false },
    resetPasswordExpires: { type: Date, default: null, select: false },
    refreshToken: { type: String, default: null, select: false },
    lastLogin: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.password
        delete ret.refreshToken
        delete ret.resetPasswordToken
        delete ret.resetPasswordExpires
        delete ret.__v
        return ret
      },
    },
  },
)

export const User = model<IUser>('User', UserSchema)
