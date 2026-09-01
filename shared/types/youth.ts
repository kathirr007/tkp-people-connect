import type { Gender } from './people'

export type EducationLevel = 'primary' | 'middle' | 'high_school' | 'higher_secondary' | 'diploma' | 'undergraduate' | 'postgraduate' | 'other'

export interface YouthEducation {
  level: string
  institution?: string
  course?: string
  yearOfStudy?: number
  yearCompleted?: number
  percentage?: number
  notes?: string
}

export interface YouthAchievement {
  title: string
  category: 'sports' | 'study' | 'extracurricular' | 'cultural' | 'community' | 'other'
  level?: 'school' | 'district' | 'state' | 'national' | 'international'
  year?: number
  description?: string
}

export interface YouthActivity {
  name: string
  type: 'sports' | 'arts' | 'music' | 'dance' | 'drama' | 'volunteering' | 'coding' | 'other'
  proficiency?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  notes?: string
}

export interface Youth {
  _id: string
  firstName: string
  lastName: string
  gender?: Gender
  dateOfBirth?: string
  age?: number
  phone?: string
  email?: string
  // Location
  village?: string
  ward?: string
  address?: string
  // Parent details
  fatherName?: string
  fatherPhone?: string
  motherName?: string
  motherPhone?: string
  // Education
  currentlyStudying: boolean
  educationDetails?: YouthEducation[]
  // Skills & Activities
  activities?: YouthActivity[]
  // Achievements & Awards
  achievements?: YouthAchievement[]
  // Interests & Goals
  interests?: string
  careerGoal?: string
  // Blood group for community events
  bloodGroup?: string
  // Meta
  notes?: string
  isActive: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface YouthFormData {
  firstName: string
  lastName: string
  gender?: Gender
  dateOfBirth?: string
  phone?: string
  email?: string
  village?: string
  ward?: string
  address?: string
  fatherName?: string
  fatherPhone?: string
  motherName?: string
  motherPhone?: string
  currentlyStudying?: boolean
  educationDetails?: YouthEducation[]
  activities?: YouthActivity[]
  achievements?: YouthAchievement[]
  interests?: string
  careerGoal?: string
  bloodGroup?: string
  notes?: string
  isActive?: boolean
}
