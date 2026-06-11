<script setup lang="ts">
import type { Youth } from '~~/shared/types'
import { z } from 'zod'

const props = defineProps<{ mode: 'create' | 'edit', initialData?: Youth }>()

const emit = defineEmits<{ success: [] }>()

const educationSchema = z.object({
  level: z.string().min(1, 'Education level is required'),
  institution: z.string().max(200).optional().or(z.literal('')),
  course: z.string().max(200).optional().or(z.literal('')),
  yearOfStudy: z.number().int().min(1).max(10).optional().nullable(),
  yearCompleted: z.number().int().min(1900).max(2100).optional().nullable(),
  percentage: z.number().min(0).max(100).optional().nullable(),
  notes: z.string().max(500).optional().or(z.literal('')),
})

const achievementSchema = z.object({
  title: z.string().min(1, 'Achievement title is required').max(200),
  category: z.enum(['sports', 'study', 'extracurricular', 'cultural', 'community', 'other']),
  level: z.enum(['school', 'district', 'state', 'national', 'international']).optional(),
  year: z.number().int().min(1900).max(2100).optional().nullable(),
  description: z.string().max(500).optional().or(z.literal('')),
})

const activitySchema = z.object({
  name: z.string().min(1, 'Activity name is required').max(100),
  type: z.enum(['sports', 'arts', 'music', 'dance', 'drama', 'volunteering', 'coding', 'other']),
  proficiency: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
  notes: z.string().max(500).optional().or(z.literal('')),
})

const youthFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  gender: z.enum(['male', 'female', 'other']).optional(),
  dateOfBirth: z.string().optional().or(z.literal('')),
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
  educationDetails: z.array(educationSchema).optional(),
  activities: z.array(activitySchema).optional(),
  achievements: z.array(achievementSchema).optional(),
  interests: z.string().max(1000).optional().or(z.literal('')),
  careerGoal: z.string().max(255).optional().or(z.literal('')),
  bloodGroup: z.string().max(10).optional().or(z.literal('')),
  notes: z.string().max(2000).optional().or(z.literal('')),
  isActive: z.boolean().optional(),
})

const { showSuccess, showApiError } = useToastMessages()
const createMutation = useCreateYouth()
const updateMutation = useUpdateYouth()

const genderOptions = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
]

const activityTypeOptions = [
  { label: 'Sports', value: 'sports' },
  { label: 'Arts', value: 'arts' },
  { label: 'Music', value: 'music' },
  { label: 'Dance', value: 'dance' },
  { label: 'Drama', value: 'drama' },
  { label: 'Volunteering', value: 'volunteering' },
  { label: 'Coding', value: 'coding' },
  { label: 'Other', value: 'other' },
]

const proficiencyOptions = [
  { label: 'Beginner', value: 'beginner' },
  { label: 'Intermediate', value: 'intermediate' },
  { label: 'Advanced', value: 'advanced' },
  { label: 'Expert', value: 'expert' },
]

const achievementCategoryOptions = [
  { label: 'Sports', value: 'sports' },
  { label: 'Study', value: 'study' },
  { label: 'Extracurricular', value: 'extracurricular' },
  { label: 'Cultural', value: 'cultural' },
  { label: 'Community', value: 'community' },
  { label: 'Other', value: 'other' },
]

const achievementLevelOptions = [
  { label: 'School', value: 'school' },
  { label: 'District', value: 'district' },
  { label: 'State', value: 'state' },
  { label: 'National', value: 'national' },
  { label: 'International', value: 'international' },
]

const bloodGroupOptions = [
  { label: 'A+', value: 'A+' },
  { label: 'A-', value: 'A-' },
  { label: 'B+', value: 'B+' },
  { label: 'B-', value: 'B-' },
  { label: 'AB+', value: 'AB+' },
  { label: 'AB-', value: 'AB-' },
  { label: 'O+', value: 'O+' },
  { label: 'O-', value: 'O-' },
]

const form = reactive({
  firstName: props.initialData?.firstName || '',
  lastName: props.initialData?.lastName || '',
  gender: (props.initialData?.gender || undefined) as 'male' | 'female' | 'other' | undefined,
  dateOfBirth: props.initialData?.dateOfBirth || '',
  phone: props.initialData?.phone || '',
  email: props.initialData?.email || '',
  village: props.initialData?.village || '',
  ward: props.initialData?.ward || '',
  address: props.initialData?.address || '',
  fatherName: props.initialData?.fatherName || '',
  fatherPhone: props.initialData?.fatherPhone || '',
  motherName: props.initialData?.motherName || '',
  motherPhone: props.initialData?.motherPhone || '',
  currentlyStudying: props.initialData?.currentlyStudying ?? true,
  educationDetails: props.initialData?.educationDetails || [],
  activities: props.initialData?.activities || [],
  achievements: props.initialData?.achievements || [],
  interests: props.initialData?.interests || '',
  careerGoal: props.initialData?.careerGoal || '',
  bloodGroup: props.initialData?.bloodGroup || '',
  notes: props.initialData?.notes || '',
  isActive: props.initialData?.isActive ?? true,
})

const errors = ref<Record<string, string>>({})
const isPending = computed(() => createMutation.isPending.value || updateMutation.isPending.value)

function validate(): boolean {
  errors.value = {}
  const result = youthFormSchema.safeParse(form)
  if (!result.success) {
    for (const issue of result.error.issues) {
      const path = issue.path.join('.')
      if (!errors.value[path])
        errors.value[path] = issue.message
    }
    return false
  }
  return true
}

async function handleSubmit() {
  if (!validate())
    return
  try {
    if (props.mode === 'create') {
      await createMutation.mutateAsync(form)
      showSuccess('Youth record created successfully')
    }
    else {
      await updateMutation.mutateAsync({ id: props.initialData!._id, data: form })
      showSuccess('Youth record updated successfully')
    }
    emit('success')
  }
  catch (e) {
    showApiError(e)
  }
}
</script>

<template>
  <Card>
    <template #content>
      <form @submit.prevent="handleSubmit">
        <h3 class="form-section-title">
          Personal Information
        </h3>
        <div class="form-grid">
          <div class="form-field">
            <label for="firstName">First Name *</label>
            <InputText id="firstName" v-model="form.firstName" placeholder="First name" fluid />
            <small v-if="errors.firstName" class="p-error">{{ errors.firstName }}</small>
          </div>
          <div class="form-field">
            <label for="lastName">Last Name *</label>
            <InputText id="lastName" v-model="form.lastName" placeholder="Last name" fluid />
            <small v-if="errors.lastName" class="p-error">{{ errors.lastName }}</small>
          </div>
          <div class="form-field">
            <label for="gender">Gender</label>
            <Select id="gender" v-model="form.gender" :options="genderOptions" option-label="label" option-value="value" placeholder="Select gender" fluid />
          </div>
          <div class="form-field">
            <label for="dateOfBirth">Date of Birth</label>
            <InputText id="dateOfBirth" v-model="form.dateOfBirth" type="date" fluid />
          </div>
          <div class="form-field">
            <label for="phone">Phone</label>
            <InputText id="phone" v-model="form.phone" placeholder="Phone number" fluid />
          </div>
          <div class="form-field">
            <label for="email">Email</label>
            <InputText id="email" v-model="form.email" type="email" placeholder="Email address" fluid />
            <small v-if="errors.email" class="p-error">{{ errors.email }}</small>
          </div>
          <div class="form-field">
            <label for="bloodGroup">Blood Group</label>
            <Select id="bloodGroup" v-model="form.bloodGroup" :options="bloodGroupOptions" option-label="label" option-value="value" placeholder="Select blood group" fluid />
          </div>
          <div class="form-field">
            <label>Record Active</label>
            <div style="display:flex;align-items:center;gap:0.5rem;padding-top:0.25rem;">
              <ToggleSwitch v-model="form.isActive" />
              <span>{{ form.isActive ? 'Active' : 'Inactive' }}</span>
            </div>
          </div>
        </div>

        <h3 class="form-section-title" style="margin-top:2rem;">
          Location
        </h3>
        <div class="form-grid">
          <div class="form-field">
            <label for="village">Village</label>
            <InputText id="village" v-model="form.village" placeholder="Village name" fluid />
          </div>
          <div class="form-field">
            <label for="ward">Ward</label>
            <InputText id="ward" v-model="form.ward" placeholder="Ward / Area" fluid />
          </div>
          <div class="form-field" style="grid-column:span 2;">
            <label for="address">Address</label>
            <InputText id="address" v-model="form.address" placeholder="Full address" fluid />
          </div>
        </div>

        <h3 class="form-section-title" style="margin-top:2rem;">
          Parent Details
        </h3>
        <div class="form-grid">
          <div class="form-field">
            <label for="fatherName">Father's Name</label>
            <InputText id="fatherName" v-model="form.fatherName" placeholder="Father's full name" fluid />
          </div>
          <div class="form-field">
            <label for="fatherPhone">Father's Phone</label>
            <InputText id="fatherPhone" v-model="form.fatherPhone" placeholder="Father's phone" fluid />
          </div>
          <div class="form-field">
            <label for="motherName">Mother's Name</label>
            <InputText id="motherName" v-model="form.motherName" placeholder="Mother's full name" fluid />
          </div>
          <div class="form-field">
            <label for="motherPhone">Mother's Phone</label>
            <InputText id="motherPhone" v-model="form.motherPhone" placeholder="Mother's phone" fluid />
          </div>
        </div>

        <h3 class="form-section-title" style="margin-top:2rem;">
          Education
        </h3>
        <div class="form-field" style="margin-bottom:1rem;">
          <label>Currently Studying</label>
          <div style="display:flex;align-items:center;gap:0.5rem;padding-top:0.25rem;">
            <ToggleSwitch v-model="form.currentlyStudying" />
            <span>{{ form.currentlyStudying ? 'Yes' : 'No' }}</span>
          </div>
        </div>
        <div v-for="(edu, index) in form.educationDetails" :key="index" style="background: var(--p-surface-50); padding: 1rem; border-radius: 0.5rem; margin-bottom: 0.75rem;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;">
            <span style="font-weight:600;">Education {{ index + 1 }}</span>
            <Button icon="pi pi-trash" severity="danger" outlined size="small" @click="form.educationDetails.splice(index, 1)" />
          </div>
          <div class="form-grid">
            <div class="form-field">
              <label :for="`eduLevel${index}`">Level *</label>
              <InputText :id="`eduLevel${index}`" v-model="edu.level" placeholder="e.g. 10th, 12th, B.E." fluid />
            </div>
            <div class="form-field">
              <label :for="`eduInstitution${index}`">Institution</label>
              <InputText :id="`eduInstitution${index}`" v-model="edu.institution" placeholder="School/College name" fluid />
            </div>
            <div class="form-field">
              <label :for="`eduCourse${index}`">Course / Stream</label>
              <InputText :id="`eduCourse${index}`" v-model="edu.course" placeholder="e.g. Science, Arts, CSE" fluid />
            </div>
            <div class="form-field">
              <label :for="`eduYear${index}`">Year of Study</label>
              <InputText :id="`eduYear${index}`" v-model.number="edu.yearOfStudy" type="number" placeholder="e.g. 2" fluid />
            </div>
            <div class="form-field">
              <label :for="`eduYearCompleted${index}`">Year Completed</label>
              <InputText :id="`eduYearCompleted${index}`" v-model.number="edu.yearCompleted" type="number" placeholder="e.g. 2024" fluid />
            </div>
            <div class="form-field">
              <label :for="`eduPercentage${index}`">Percentage / CGPA</label>
              <InputText :id="`eduPercentage${index}`" v-model.number="edu.percentage" type="number" placeholder="e.g. 85" fluid />
            </div>
          </div>
        </div>
        <div style="margin-top:0.5rem;">
          <Button icon="pi pi-plus" label="Add Education" severity="secondary" outlined @click="form.educationDetails.push({ level: '' })" />
        </div>

        <h3 class="form-section-title" style="margin-top:2rem;">
          Activities & Skills
        </h3>
        <div v-for="(activity, index) in form.activities" :key="index" style="background: var(--p-surface-50); padding: 1rem; border-radius: 0.5rem; margin-bottom: 0.75rem;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;">
            <span style="font-weight:600;">Activity {{ index + 1 }}</span>
            <Button icon="pi pi-trash" severity="danger" outlined size="small" @click="form.activities.splice(index, 1)" />
          </div>
          <div class="form-grid">
            <div class="form-field">
              <label :for="`actName${index}`">Activity Name *</label>
              <InputText :id="`actName${index}`" v-model="activity.name" placeholder="e.g. Cricket, Painting" fluid />
            </div>
            <div class="form-field">
              <label :for="`actType${index}`">Type *</label>
              <Select :id="`actType${index}`" v-model="activity.type" :options="activityTypeOptions" option-label="label" option-value="value" placeholder="Select type" fluid />
            </div>
            <div class="form-field">
              <label :for="`actProficiency${index}`">Proficiency</label>
              <Select :id="`actProficiency${index}`" v-model="activity.proficiency" :options="proficiencyOptions" option-label="label" option-value="value" placeholder="Select level" fluid />
            </div>
            <div class="form-field">
              <label :for="`actNotes${index}`">Notes</label>
              <InputText :id="`actNotes${index}`" v-model="activity.notes" placeholder="Additional details" fluid />
            </div>
          </div>
        </div>
        <div style="margin-top:0.5rem;">
          <Button icon="pi pi-plus" label="Add Activity" severity="secondary" outlined @click="form.activities.push({ name: '', type: 'sports' })" />
        </div>

        <h3 class="form-section-title" style="margin-top:2rem;">
          Achievements & Awards
        </h3>
        <div v-for="(achievement, index) in form.achievements" :key="index" style="background: var(--p-surface-50); padding: 1rem; border-radius: 0.5rem; margin-bottom: 0.75rem;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;">
            <span style="font-weight:600;">Achievement {{ index + 1 }}</span>
            <Button icon="pi pi-trash" severity="danger" outlined size="small" @click="form.achievements.splice(index, 1)" />
          </div>
          <div class="form-grid">
            <div class="form-field">
              <label :for="`achTitle${index}`">Title *</label>
              <InputText :id="`achTitle${index}`" v-model="achievement.title" placeholder="e.g. District Chess Champion" fluid />
            </div>
            <div class="form-field">
              <label :for="`achCategory${index}`">Category *</label>
              <Select :id="`achCategory${index}`" v-model="achievement.category" :options="achievementCategoryOptions" option-label="label" option-value="value" placeholder="Select category" fluid />
            </div>
            <div class="form-field">
              <label :for="`achLevel${index}`">Level</label>
              <Select :id="`achLevel${index}`" v-model="achievement.level" :options="achievementLevelOptions" option-label="label" option-value="value" placeholder="Select level" fluid />
            </div>
            <div class="form-field">
              <label :for="`achYear${index}`">Year</label>
              <InputText :id="`achYear${index}`" v-model.number="achievement.year" type="number" placeholder="e.g. 2024" fluid />
            </div>
            <div class="form-field" style="grid-column:span 2;">
              <label :for="`achDesc${index}`">Description</label>
              <InputText :id="`achDesc${index}`" v-model="achievement.description" placeholder="Brief description" fluid />
            </div>
          </div>
        </div>
        <div style="margin-top:0.5rem;">
          <Button icon="pi pi-plus" label="Add Achievement" severity="secondary" outlined @click="form.achievements.push({ title: '', category: 'sports' })" />
        </div>

        <h3 class="form-section-title" style="margin-top:2rem;">
          Interests & Goals
        </h3>
        <div class="form-grid">
          <div class="form-field" style="grid-column:span 2;">
            <label for="interests">Interests / Hobbies</label>
            <Textarea id="interests" v-model="form.interests" placeholder="E.g. Reading, gardening, sports..." rows="3" fluid />
          </div>
          <div class="form-field" style="grid-column:span 2;">
            <label for="careerGoal">Career Goal / Aspiration</label>
            <InputText id="careerGoal" v-model="form.careerGoal" placeholder="E.g. Engineer, Doctor, Teacher..." fluid />
          </div>
        </div>

        <h3 class="form-section-title" style="margin-top:2rem;">
          Notes
        </h3>
        <div class="form-field">
          <Textarea id="notes" v-model="form.notes" placeholder="Additional notes" rows="4" fluid />
        </div>

        <div class="form-actions">
          <Button label="Cancel" severity="secondary" outlined @click="navigateTo('/youth')" />
          <Button type="submit" :label="mode === 'create' ? 'Create Record' : 'Save Changes'" :loading="isPending" />
        </div>
      </form>
    </template>
  </Card>
</template>

<style scoped>
.form-section-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
}
</style>
