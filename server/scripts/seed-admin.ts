import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tkp-people-connect'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@tkp-people-connect.com'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123'
const ADMIN_FIRST_NAME = process.env.ADMIN_FIRST_NAME || 'Admin'
const ADMIN_LAST_NAME = process.env.ADMIN_LAST_NAME || 'User'

async function seedAdmin() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('[Seed] Connected to MongoDB')

    const UserModel = mongoose.model('User', new mongoose.Schema({
      email: { type: String, required: true, unique: true, lowercase: true },
      password: { type: String, required: true },
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      role: { type: String, enum: ['admin', 'user', 'viewer'], default: 'viewer' },
      isVerified: { type: Boolean, default: false },
      verificationToken: { type: String, default: null },
      resetPasswordToken: { type: String, default: null },
      resetPasswordExpires: { type: Date, default: null },
      refreshToken: { type: String, default: null },
      lastLogin: { type: Date, default: null },
    }, { timestamps: true }))

    const existing = await UserModel.findOne({ email: ADMIN_EMAIL })
    if (existing) {
      console.log(`[Seed] Admin user already exists: ${ADMIN_EMAIL}`)
      await mongoose.disconnect()
      return
    }

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12)

    await UserModel.create({
      email: ADMIN_EMAIL,
      password: hashedPassword,
      firstName: ADMIN_FIRST_NAME,
      lastName: ADMIN_LAST_NAME,
      role: 'admin',
      isVerified: true,
    })

    console.log(`[Seed] Admin user created: ${ADMIN_EMAIL}`)
    console.log('[Seed] You can now log in with the admin credentials')
  }
  catch (error) {
    console.error('[Seed] Error:', error)
    process.exit(1)
  }
  finally {
    await mongoose.disconnect()
  }
}

seedAdmin()
