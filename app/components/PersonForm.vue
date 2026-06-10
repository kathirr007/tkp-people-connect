<script setup lang="ts">
import { z } from 'zod'
import type { Person } from '~~/shared/types'

const childSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  dateOfBirth: z.string().optional().or(z.literal('')),
  gender: z.enum(['male', 'female', 'other']).optional(),
  phone: z.string().max(20).optional().or(z.literal('')),
})

const educationSchema = z.object({
  level: z.string().min(1, 'Education level is required'),
  institution: z.string().max(200).optional().or(z.literal('')),
  yearCompleted: z.number().int().min(1900).max(2100).optional().nullable(),
  notes: z.string().max(500).optional().or(z.literal('')),
})

const personSchema = z.object({
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
  maritalStatus: z.enum(['single', 'married', 'widowed', 'divorced']).optional(),
  spouseName: z.string().max(100).optional().or(z.literal('')),
  spousePhone: z.string().max(20).optional().or(z.literal('')),
  marriageYear: z.number().int().min(1900).max(2100).optional().nullable(),
  numberOfChildren: z.number().int().min(0).optional().nullable(),
  children: z.array(childSchema).optional().or(z.literal([])),
  education: z.array(educationSchema).optional().or(z.literal([])),
  notes: z.string().max(2000).optional().or(z.literal('')),
  isAlive: z.boolean().optional(),
  isActive: z.boolean().optional(),
})

const props = defineProps<{ mode: 'create' | 'edit', initialData?: Person }>()
const emit = defineEmits<{ success: [] }>()

const { showSuccess, showApiError } = useToastMessages()
const createMutation = useCreatePerson()
const updateMutation = useUpdatePerson()

const genderOptions = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
]
const maritalStatusOptions = [
  { label: 'Single', value: 'single' },
  { label: 'Married', value: 'married' },
  { label: 'Widowed', value: 'widowed' },
  { label: 'Divorced', value: 'divorced' },
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
  maritalStatus: (props.initialData?.maritalStatus || undefined) as 'single' | 'married' | 'widowed' | 'divorced' | undefined,
  spouseName: props.initialData?.spouseName || '',
  spousePhone: props.initialData?.spousePhone || '',
  marriageYear: props.initialData?.marriageYear || null as number | null,
  numberOfChildren: props.initialData?.numberOfChildren ?? null as number | null,
  children: props.initialData?.children || [],
  education: props.initialData?.education || [],
  notes: props.initialData?.notes || '',
  isAlive: props.initialData?.isAlive ?? true,
  isActive: props.initialData?.isActive ?? true,
})

const errors = ref<Record<string, string>>({})
const isPending = computed(() => createMutation.isPending.value || updateMutation.isPending.value)

function validate(): boolean {
  errors.value = {}
  const result = personSchema.safeParse(form)
  if (!result.success) {
    for (const issue of result.error.issues) {
      const path = issue.path.join('.')
      if (!errors.value[path]) errors.value[path] = issue.message
    }
    return false
  }
  return true
}

async function handleSubmit() {
  if (!validate()) return
  try {
    if (props.mode === 'create') {
      await createMutation.mutateAsync(form)
      showSuccess('Person created successfully')
    }
    else {
      await updateMutation.mutateAsync({ id: props.initialData!._id, data: form })
      showSuccess('Person updated successfully')
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
            <label>Status</label>
            <div style="display:flex;align-items:center;gap:0.5rem;padding-top:0.25rem;">
              <ToggleSwitch v-model="form.isAlive" />
              <span>{{ form.isAlive ? 'Alive' : 'Deceased' }}</span>
            </div>
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
          Own Family
        </h3>
        <div class="form-grid">
          <div class="form-field">
            <label for="maritalStatus">Marital Status</label>
            <Select id="maritalStatus" v-model="form.maritalStatus" :options="maritalStatusOptions" option-label="label" option-value="value" placeholder="Select status" fluid />
          </div>
          <div class="form-field">
            <label for="marriageYear">Marriage Year</label>
            <InputText id="marriageYear" v-model.number="form.marriageYear" type="number" placeholder="e.g. 2005" fluid />
          </div>
          <div class="form-field">
            <label for="spouseName">Spouse's Name</label>
            <InputText id="spouseName" v-model="form.spouseName" placeholder="Spouse's full name" fluid />
          </div>
          <div class="form-field">
            <label for="spousePhone">Spouse's Phone</label>
            <InputText id="spousePhone" v-model="form.spousePhone" placeholder="Spouse's phone" fluid />
          </div>
          <div class="form-field">
            <label for="numberOfChildren">Number of Children</label>
            <InputText id="numberOfChildren" v-model.number="form.numberOfChildren" type="number" placeholder="0" fluid />
          </div>
        </div>

        <h3 class="form-section-title" style="margin-top:2rem;">
          Children Details
        </h3>
        <div v-for="(child, index) in form.children" :key="index" class="child-entry" style="background: var(--p-surface-50); padding: 1rem; border-radius: 0.5rem; margin-bottom: 0.75rem;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;">
            <span style="font-weight:600;">Child {{ index + 1 }}</span>
            <Button icon="pi pi-trash" severity="danger" outlined size="small" @click="form.children.splice(index, 1)" v-if="form.children.length > 1" />
          </div>
          <div class="form-grid">
            <div class="form-field">
              <label :for="'childName' + index">Name *</label>
              <InputText :id="'childName' + index" v-model="child.name" placeholder="Child's name" fluid />
              <small v-if="errors.children?.[index]?.name" class="p-error">{{ errors.children[index].name }}</small>
            </div>
            <div class="form-field">
              <label :for="'childGender' + index">Gender</label>
              <Select :id="'childGender' + index" v-model="child.gender" :options="genderOptions" option-label="label" option-value="value" placeholder="Select gender" fluid />
            </div>
            <div class="form-field">
              <label :for="'childDOB' + index">Date of Birth</label>
              <InputText :id="'childDOB' + index" v-model="child.dateOfBirth" type="date" fluid />
            </div>
            <div class="form-field">
              <label :for="'childPhone' + index">Phone</label>
              <InputText :id="'childPhone' + index" v-model="child.phone" placeholder="Phone number" fluid />
            </div>
          </div>
        </div>
        <div style="margin-top:0.5rem;">
          <Button icon="pi pi-plus" label="Add Child" severity="secondary" outlined @click="form.children.push({ name: '', phone: '' })" />
        </div>

        <h3 class="form-section-title" style="margin-top:2rem;">
          Education Details
        </h3>
        <div v-for="(edu, index) in form.education" :key="index" class="education-entry" style="background: var(--p-surface-50); padding: 1rem; border-radius: 0.5rem; margin-bottom: 0.75rem;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;">
            <span style="font-weight:600;">Education {{ index + 1 }}</span>
            <Button icon="pi pi-trash" severity="danger" outlined size="small" @click="form.education.splice(index, 1)" v-if="form.education.length > 1" />
          </div>
          <div class="form-grid">
            <div class="form-field">
              <label :for="'eduLevel' + index">Education Level *</label>
              <InputText :id="'eduLevel' + index" v-model="edu.level" placeholder="e.g. Bachelor's, High School" fluid />
              <small v-if="errors.education?.[index]?.level" class="p-error">{{ errors.education[index].level }}</small>
            </div>
            <div class="form-field">
              <label :for="'eduInstitution' + index">Institution</label>
              <InputText :id="'eduInstitution' + index" v-model="edu.institution" placeholder="School/University name" fluid />
            </div>
            <div class="form-field">
              <label :for="'eduYear' + index">Year Completed</label>
              <InputText :id="'eduYear' + index" v-model.number="edu.yearCompleted" type="number" placeholder="e.g. 2020" fluid />
            </div>
          </div>
          <div class="form-field" style="grid-column:span 2;">
            <label :for="'eduNotes' + index">Notes</label>
            <InputText :id="'eduNotes' + index" v-model="edu.notes" placeholder="Additional notes" fluid />
          </div>
        </div>
        <div style="margin-top:0.5rem;">
          <Button icon="pi pi-plus" label="Add Education" severity="secondary" outlined @click="form.education.push({ level: '' })" />
        </div>

        <h3 class="form-section-title" style="margin-top:2rem;">
          Notes
        </h3>
        <div class="form-field">
          <Textarea id="notes" v-model="form.notes" placeholder="Additional notes" rows="4" fluid />
        </div>

        <div class="form-actions">
          <Button label="Cancel" severity="secondary" outlined @click="navigateTo('/people')" />
          <Button type="submit" :label="mode === 'create' ? 'Create Person' : 'Save Changes'" :loading="isPending" />
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
