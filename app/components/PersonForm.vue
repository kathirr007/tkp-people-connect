<script setup lang="ts">
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Chips from 'primevue/chips'
import ToggleSwitch from 'primevue/toggleswitch'
import Button from 'primevue/button'
import { z } from 'zod'
import type { Person } from '~~/shared/types'

const personSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().max(20).optional().or(z.literal('')),
  address: z.object({
    street: z.string().max(200).optional().or(z.literal('')),
    city: z.string().max(100).optional().or(z.literal('')),
    state: z.string().max(100).optional().or(z.literal('')),
    zipCode: z.string().max(20).optional().or(z.literal('')),
    country: z.string().max(100).optional().or(z.literal('')),
  }).optional(),
  organization: z.string().max(200).optional().or(z.literal('')),
  designation: z.string().max(200).optional().or(z.literal('')),
  department: z.string().max(200).optional().or(z.literal('')),
  notes: z.string().max(2000).optional().or(z.literal('')),
  tags: z.array(z.string().max(50)).max(20).optional(),
  isActive: z.boolean().optional(),
})

const props = defineProps<{
  mode: 'create' | 'edit'
  initialData?: Person
}>()

const emit = defineEmits<{ success: [] }>()

const { showSuccess, showApiError } = useToastMessages()
const createMutation = useCreatePerson()
const updateMutation = useUpdatePerson()

const form = reactive({
  firstName: props.initialData?.firstName || '',
  lastName: props.initialData?.lastName || '',
  email: props.initialData?.email || '',
  phone: props.initialData?.phone || '',
  organization: props.initialData?.organization || '',
  designation: props.initialData?.designation || '',
  department: props.initialData?.department || '',
  notes: props.initialData?.notes || '',
  tags: props.initialData?.tags || [] as string[],
  isActive: props.initialData?.isActive ?? true,
  address: {
    street: props.initialData?.address?.street || '',
    city: props.initialData?.address?.city || '',
    state: props.initialData?.address?.state || '',
    zipCode: props.initialData?.address?.zipCode || '',
    country: props.initialData?.address?.country || '',
  },
})

const errors = ref<Record<string, string>>({})
const isPending = computed(() => createMutation.isPending.value || updateMutation.isPending.value)

function validate(): boolean {
  errors.value = {}
  const result = personSchema.safeParse(form)
  if (!result.success) {
    for (const issue of result.error.issues) {
      const path = issue.path.join('.')
      if (!errors.value[path]) {
        errors.value[path] = issue.message
      }
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
        <h3 style="font-size: 1rem; font-weight: 600; margin-bottom: 1rem;">Basic Information</h3>
        <div class="form-grid">
          <div class="form-field">
            <label for="firstName">First Name *</label>
            <InputText id="firstName" v-model="form.firstName" placeholder="First name" fluid />
            <small v-if="errors.firstName">{{ errors.firstName }}</small>
          </div>
          <div class="form-field">
            <label for="lastName">Last Name *</label>
            <InputText id="lastName" v-model="form.lastName" placeholder="Last name" fluid />
            <small v-if="errors.lastName">{{ errors.lastName }}</small>
          </div>
          <div class="form-field">
            <label for="email">Email</label>
            <InputText id="email" v-model="form.email" type="email" placeholder="Email address" fluid />
            <small v-if="errors.email">{{ errors.email }}</small>
          </div>
          <div class="form-field">
            <label for="phone">Phone</label>
            <InputText id="phone" v-model="form.phone" placeholder="Phone number" fluid />
            <small v-if="errors.phone">{{ errors.phone }}</small>
          </div>
          <div class="form-field">
            <label for="organization">Organization</label>
            <InputText id="organization" v-model="form.organization" placeholder="Company/Organization" fluid />
          </div>
          <div class="form-field">
            <label for="designation">Designation</label>
            <InputText id="designation" v-model="form.designation" placeholder="Job title" fluid />
          </div>
          <div class="form-field">
            <label for="department">Department</label>
            <InputText id="department" v-model="form.department" placeholder="Department" fluid />
          </div>
          <div class="form-field">
            <label>Status</label>
            <div style="display: flex; align-items: center; gap: 0.5rem; padding-top: 0.25rem;">
              <ToggleSwitch v-model="form.isActive" />
              <span>{{ form.isActive ? 'Active' : 'Inactive' }}</span>
            </div>
          </div>
        </div>

        <h3 style="font-size: 1rem; font-weight: 600; margin-top: 2rem; margin-bottom: 1rem;">Address</h3>
        <div class="form-grid">
          <div class="form-field" style="grid-column: span 2;">
            <label for="street">Street</label>
            <InputText id="street" v-model="form.address.street" placeholder="Street address" fluid />
          </div>
          <div class="form-field">
            <label for="city">City</label>
            <InputText id="city" v-model="form.address.city" placeholder="City" fluid />
          </div>
          <div class="form-field">
            <label for="state">State</label>
            <InputText id="state" v-model="form.address.state" placeholder="State/Province" fluid />
          </div>
          <div class="form-field">
            <label for="zipCode">Zip Code</label>
            <InputText id="zipCode" v-model="form.address.zipCode" placeholder="Zip/Postal code" fluid />
          </div>
          <div class="form-field">
            <label for="country">Country</label>
            <InputText id="country" v-model="form.address.country" placeholder="Country" fluid />
          </div>
        </div>

        <h3 style="font-size: 1rem; font-weight: 600; margin-top: 2rem; margin-bottom: 1rem;">Additional</h3>
        <div class="form-field" style="margin-bottom: 1rem;">
          <label for="tags">Tags</label>
          <Chips id="tags" v-model="form.tags" placeholder="Type and press Enter" fluid />
        </div>
        <div class="form-field">
          <label for="notes">Notes</label>
          <Textarea id="notes" v-model="form.notes" placeholder="Additional notes" rows="4" fluid />
        </div>

        <div class="form-actions">
          <Button
            label="Cancel"
            severity="secondary"
            outlined
            @click="navigateTo('/people')"
          />
          <Button
            type="submit"
            :label="mode === 'create' ? 'Create Person' : 'Save Changes'"
            :loading="isPending"
          />
        </div>
      </form>
    </template>
  </Card>
</template>
