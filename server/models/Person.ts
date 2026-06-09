import { Schema, model } from 'mongoose'
import type { Document, Types } from 'mongoose'

export interface IPerson extends Document {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  organization: string
  designation: string
  department: string
  notes: string
  tags: string[]
  isActive: boolean
  createdBy: Types.ObjectId
  updatedBy: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const PersonSchema = new Schema<IPerson>(
  {
    firstName: { type: String, required: true, trim: true, index: true },
    lastName: { type: String, required: true, trim: true, index: true },
    email: { type: String, trim: true, lowercase: true, sparse: true, index: true },
    phone: { type: String, trim: true },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      zipCode: { type: String, trim: true },
      country: { type: String, trim: true },
    },
    organization: { type: String, trim: true, index: true },
    designation: { type: String, trim: true },
    department: { type: String, trim: true },
    notes: { type: String, trim: true },
    tags: [{ type: String, trim: true }],
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, versionKey: false },
  },
)

PersonSchema.index(
  { firstName: 'text', lastName: 'text', email: 'text', organization: 'text' },
  { name: 'people_search_index' },
)

export const Person = model<IPerson>('Person', PersonSchema)
