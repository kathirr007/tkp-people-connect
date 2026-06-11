<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

const route = useRoute()
const { canEdit } = useAuth()
const id = computed(() => route.params.id as string)
const { data, isPending } = usePerson(id)
const person = computed(() => data.value?.data)

const formatName = (firstName: string, lastName: string) => `${firstName} ${lastName}`.trim()
const formatDate = (date: string) => date ? new Date(date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'
const formatStatus = (value: boolean, alive: boolean) => value ? (alive ? 'Alive' : 'Active') : (alive ? 'Deceased' : 'Inactive')

const statusSeverity = (value: boolean, alive: boolean) => {
  if (!value) return alive ? 'secondary' : 'danger'
  return alive ? 'success' : 'info'
}
</script>

<template>
  <main>
    <div class="page-header" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem;">
      <div>
        <h1>Person Details</h1>
        <p v-if="person" class="text-muted" style="margin:0.5rem 0 0 0;font-size:0.9rem;">
          ID: {{ id }}
        </p>
      </div>
      <div style="display:flex;gap:0.75rem;flex-wrap:wrap;">
        <Button label="Back" icon="pi pi-arrow-left" severity="secondary" outlined @click="navigateTo('/people')" />
        <Button v-if="canEdit && person" label="Edit" icon="pi pi-pencil" @click="navigateTo(`/people/${id}/edit`)" />
      </div>
    </div>

    <div v-if="isPending">
      <Card><template #content><Skeleton v-for="i in 8" :key="i" height="1.5rem" class="mb-3" /></template></Card>
    </div>

    <template v-else-if="person">
      <!-- Personal Information -->
      <Card style="border-radius:1rem;margin-bottom:2rem;">
        <template #title>
          <div style="display:flex;align-items:center;gap:0.5rem;">
            <i class="pi pi-user" style="font-size:1.25rem;color:var(--p-primary-500);" />
            <h3 class="form-section-title" style="margin:0;">Personal Information</h3>
          </div>
        </template>
        <template #content>
          <div class="form-grid" style="gap:1.5rem;">
            <div class="form-field-detail">
              <label class="form-detail-label">Full Name</label>
              <p class="form-detail-value">{{ formatName(person.firstName, person.lastName) }}</p>
            </div>
            <div class="form-field-detail">
              <label class="form-detail-label">Gender</label>
              <p class="form-detail-value">{{ person.gender ? person.gender.charAt(0).toUpperCase() + person.gender.slice(1) : '-' }}</p>
            </div>
            <div class="form-field-detail">
              <label class="form-detail-label">Date of Birth</label>
              <p class="form-detail-value">{{ formatDate(person.dateOfBirth as string) }}</p>
            </div>
            <div class="form-field-detail">
              <label class="form-detail-label">Phone</label>
              <p class="form-detail-value">{{ person.phone || '-' }}</p>
            </div>
            <div class="form-field-detail">
              <label class="form-detail-label">Email</label>
              <p class="form-detail-value">{{ person.email || '-' }}</p>
            </div>
            <div class="form-field-detail">
              <label class="form-detail-label">Status</label>
              <div style="display:flex;gap:0.75rem;flex-wrap:wrap;">
                <Tag :value="person.isAlive ? 'Alive' : 'Deceased'" :severity="statusSeverity(person.isAlive, true)" />
                <Tag :value="person.isActive ? 'Active' : 'Inactive'" :severity="statusSeverity(person.isActive, false)" />
              </div>
            </div>
          </div>
        </template>
      </Card>

      <!-- Location -->
      <Card style="border-radius:1rem;margin-bottom:2rem;">
        <template #title>
          <div style="display:flex;align-items:center;gap:0.5rem;">
            <i class="pi pi-map" style="font-size:1.25rem;color:var(--p-primary-500);" />
            <h3 class="form-section-title" style="margin:0;">Location</h3>
          </div>
        </template>
        <template #content>
          <div class="form-grid" style="gap:1.5rem;">
            <div class="form-field-detail">
              <label class="form-detail-label">Village</label>
              <p class="form-detail-value">{{ person.village || '-' }}</p>
            </div>
            <div class="form-field-detail">
              <label class="form-detail-label">Ward</label>
              <p class="form-detail-value">{{ person.ward || '-' }}</p>
            </div>
            <div class="form-field-detail" style="grid-column:span 2;">
              <label class="form-detail-label">Address</label>
              <p class="form-detail-value" style="white-space:pre-wrap;">{{ person.address || '-' }}</p>
            </div>
          </div>
        </template>
      </Card>

      <!-- Parent Details -->
      <Card style="border-radius:1rem;margin-bottom:2rem;">
        <template #title>
          <div style="display:flex;align-items:center;gap:0.5rem;">
            <i class="pi pi-users" style="font-size:1.25rem;color:var(--p-primary-500);" />
            <h3 class="form-section-title" style="margin:0;">Parent Details</h3>
          </div>
        </template>
        <template #content>
          <div class="form-grid" style="gap:1.5rem;">
            <div class="form-field-detail">
              <label class="form-detail-label">Father's Name</label>
              <p class="form-detail-value">{{ person.fatherName || '-' }}</p>
            </div>
            <div class="form-field-detail">
              <label class="form-detail-label">Father's Phone</label>
              <p class="form-detail-value">{{ person.fatherPhone || '-' }}</p>
            </div>
            <div class="form-field-detail">
              <label class="form-detail-label">Mother's Name</label>
              <p class="form-detail-value">{{ person.motherName || '-' }}</p>
            </div>
            <div class="form-field-detail">
              <label class="form-detail-label">Mother's Phone</label>
              <p class="form-detail-value">{{ person.motherPhone || '-' }}</p>
            </div>
          </div>
        </template>
      </Card>

      <!-- Own Family -->
      <Card v-if="person.maritalStatus === 'married'" style="border-radius:1rem;margin-bottom:2rem;">
        <template #title>
          <div style="display:flex;align-items:center;gap:0.5rem;">
            <i class="pi pi-heart" style="font-size:1.25rem;color:var(--p-primary-500);" />
            <h3 class="form-section-title" style="margin:0;">Family</h3>
          </div>
        </template>
        <template #content>
          <div class="form-grid" style="gap:1.5rem;">
            <div class="form-field-detail">
              <label class="form-detail-label">Marital Status</label>
              <p class="form-detail-value">{{ person.maritalStatus ? person.maritalStatus.charAt(0).toUpperCase() + person.maritalStatus.slice(1) : '-' }}</p>
            </div>
            <div class="form-field-detail">
              <label class="form-detail-label">Marriage Year</label>
              <p class="form-detail-value">{{ person.marriageYear || '-' }}</p>
            </div>
            <div class="form-field-detail">
              <label class="form-detail-label">Spouse's Name</label>
              <p class="form-detail-value">{{ person.spouseName || '-' }}</p>
            </div>
            <div class="form-field-detail">
              <label class="form-detail-label">Spouse's Phone</label>
              <p class="form-detail-value">{{ person.spousePhone || '-' }}</p>
            </div>
            <div class="form-field-detail">
              <label class="form-detail-label">Number of Children</label>
              <p class="form-detail-value">{{ person.numberOfChildren ?? '-' }}</p>
            </div>
          </div>
        </template>
      </Card>

      <!-- Children Details -->
      <Card v-if="person.children && person.children.length > 0" style="border-radius:1rem;margin-bottom:2rem;">
        <template #title>
          <div style="display:flex;align-items:center;gap:0.5rem;">
            <i class="pi pi-user-plus" style="font-size:1.25rem;color:var(--p-primary-500);" />
            <h3 class="form-section-title" style="margin:0;">Children Details</h3>
            <Tag :value="person.children.length" style="margin-left:auto;" severity="info" />
          </div>
        </template>
        <template #content>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:1rem;">
            <div v-for="(child, index) in person.children" :key="index" style="background:var(--p-surface-100);padding:1rem;border-radius:0.75rem;">
              <h4 style="margin:0 0 0.75rem 0;color:var(--p-text-color);font-size:1rem;">Child {{ index + 1 }}</h4>
              <div style="display:grid;grid-template-columns:1fr auto;gap:0.25rem;font-size:0.875rem;">
                <span class="form-detail-label">Name:</span>
                <p style="margin:0">{{ child.name }}</p>
                <span class="form-detail-label">Gender:</span>
                <p style="margin:0">{{ child.gender ? child.gender.charAt(0).toUpperCase() + child.gender.slice(1) : '-' }}</p>
                <span class="form-detail-label">DOB:</span>
                <p style="margin:0">{{ formatDate(child.dateOfBirth as string) }}</p>
                <span class="form-detail-label">Phone:</span>
                <p style="margin:0">{{ child.phone || '-' }}</p>
              </div>
            </div>
          </div>
        </template>
      </Card>

      <!-- Education Details -->
      <Card v-if="person.education && person.education.length > 0" style="border-radius:1rem;margin-bottom:2rem;">
        <template #title>
          <div style="display:flex;align-items:center;gap:0.5rem;">
            <i class="pi pi-graduation-cap" style="font-size:1.25rem;color:var(--p-primary-500);" />
            <h3 class="form-section-title" style="margin:0;">Education</h3>
            <Tag :value="person.education.length" style="margin-left:auto;" severity="info" />
          </div>
        </template>
        <template #content>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:1rem;">
            <div v-for="(edu, index) in person.education" :key="index" style="background:var(--p-surface-100);padding:1rem;border-radius:0.75rem;">
              <h4 style="margin:0 0 0.75rem 0;color:var(--p-text-color);font-size:1rem;">Education {{ index + 1 }}</h4>
              <div style="display:grid;grid-template-columns:1fr auto;gap:0.25rem;font-size:0.875rem;">
                <span class="form-detail-label">Level:</span>
                <p style="margin:0">{{ edu.level }}</p>
                <span class="form-detail-label">Institution:</span>
                <p style="margin:0">{{ edu.institution || '-' }}</p>
                <span class="form-detail-label">Year Completed:</span>
                <p style="margin:0">{{ edu.yearCompleted || '-' }}</p>
                <span class="form-detail-label">Notes:</span>
                <p style="margin:0">{{ edu.notes || '-' }}</p>
              </div>
            </div>
          </div>
        </template>
      </Card>

      <!-- Notes -->
      <Card v-if="person.notes" style="border-radius:1rem;margin-bottom:2rem;">
        <template #title>
          <div style="display:flex;align-items:center;gap:0.5rem;">
            <i class="pi pi-comment" style="font-size:1.25rem;color:var(--p-primary-500);" />
            <h3 class="form-section-title" style="margin:0;">Notes</h3>
          </div>
        </template>
        <template #content>
          <p style="white-space:pre-wrap;font-size:0.95rem;color:var(--p-text-color);">{{ person.notes }}</p>
        </template>
      </Card>
    </template>
  </main>
</template>

<style scoped>
.page-header h1 {
  margin: 0;
  font-size: 1.5rem;
}

.text-muted {
  color: var(--p-text-muted-color);
}

.form-section-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
}

.form-detail-label {
  color: var(--p-text-muted-color);
  font-size: 0.875rem;
}

.form-detail-value {
  margin: 0;
  font-size: 1rem;
  color: var(--p-text-color);
}

:deep(.p-tag) {
  font-size: 0.875rem;
  padding: 0.25rem 0.5rem;
}
</style>
