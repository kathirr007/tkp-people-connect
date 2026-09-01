<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

const route = useRoute()
const { canEdit } = useAuth()
const id = computed(() => route.params.id as string)
const { data, isPending } = useYouthRecord(id)
const person = computed(() => data.value?.data)

const formatDate = (date: string) => date ? new Date(date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'

const categoryLabel = (cat: string) => cat ? cat.charAt(0).toUpperCase() + cat.slice(1) : '-'
</script>

<template>
  <div class="page-container">
    <div class="page-header" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem;">
      <div>
        <h1>Youth Details</h1>
        <p v-if="person" class="text-muted" style="margin:0.5rem 0 0 0;font-size:0.9rem;">
          ID: {{ id }}
        </p>
      </div>
      <div style="display:flex;gap:0.75rem;flex-wrap:wrap;">
        <Button label="Back" icon="pi pi-arrow-left" severity="secondary" outlined @click="navigateTo('/youth')" />
        <Button v-if="canEdit && person" label="Edit" icon="pi pi-pencil" @click="navigateTo(`/youth/${id}/edit`)" />
      </div>
    </div>

    <div v-if="isPending">
      <Card>
        <template #content>
          <Skeleton v-for="i in 8" :key="i" height="1.5rem" class="mb-3" />
        </template>
      </Card>
    </div>

    <template v-else-if="person">
      <!-- Personal Information -->
      <Card style="border-radius:1rem;margin-bottom:2rem;">
        <template #title>
          <div style="display:flex;align-items:center;gap:0.5rem;">
            <i class="pi pi-user" style="font-size:1.25rem;color:var(--p-primary-500);" />
            <h3 class="form-section-title" style="margin:0;">
              Personal Information
            </h3>
          </div>
        </template>
        <template #content>
          <div class="form-grid" style="gap:1.5rem;">
            <div class="form-field-detail">
              <label class="form-detail-label">Full Name</label>
              <p class="form-detail-value">
                {{ person.firstName }} {{ person.lastName }}
              </p>
            </div>
            <div class="form-field-detail">
              <label class="form-detail-label">Gender</label>
              <p class="form-detail-value">
                {{ person.gender ? person.gender.charAt(0).toUpperCase() + person.gender.slice(1) : '-' }}
              </p>
            </div>
            <div class="form-field-detail">
              <label class="form-detail-label">Date of Birth</label>
              <p class="form-detail-value">
                {{ formatDate(person.dateOfBirth as string) }}
              </p>
            </div>
            <div class="form-field-detail">
              <label class="form-detail-label">Age</label>
              <p class="form-detail-value">
                {{ person.age !== null ? person.age : '-' }}
              </p>
            </div>
            <div class="form-field-detail">
              <label class="form-detail-label">Phone</label>
              <p class="form-detail-value">
                {{ person.phone || '-' }}
              </p>
            </div>
            <div class="form-field-detail">
              <label class="form-detail-label">Email</label>
              <p class="form-detail-value">
                {{ person.email || '-' }}
              </p>
            </div>
            <div class="form-field-detail">
              <label class="form-detail-label">Blood Group</label>
              <p class="form-detail-value">
                {{ person.bloodGroup || '-' }}
              </p>
            </div>
            <div class="form-field-detail">
              <label class="form-detail-label">Status</label>
              <Tag :value="person.isActive ? 'Active' : 'Inactive'" :severity="person.isActive ? 'info' : 'danger'" />
            </div>
          </div>
        </template>
      </Card>

      <!-- Location -->
      <Card style="border-radius:1rem;margin-bottom:2rem;">
        <template #title>
          <div style="display:flex;align-items:center;gap:0.5rem;">
            <i class="pi pi-map" style="font-size:1.25rem;color:var(--p-primary-500);" />
            <h3 class="form-section-title" style="margin:0;">
              Location
            </h3>
          </div>
        </template>
        <template #content>
          <div class="form-grid" style="gap:1.5rem;">
            <div class="form-field-detail">
              <label class="form-detail-label">Village</label>
              <p class="form-detail-value">
                {{ person.village || '-' }}
              </p>
            </div>
            <div class="form-field-detail">
              <label class="form-detail-label">Ward</label>
              <p class="form-detail-value">
                {{ person.ward || '-' }}
              </p>
            </div>
            <div class="form-field-detail" style="grid-column:span 2;">
              <label class="form-detail-label">Address</label>
              <p class="form-detail-value" style="white-space:pre-wrap;">
                {{ person.address || '-' }}
              </p>
            </div>
          </div>
        </template>
      </Card>

      <!-- Parent Details -->
      <Card style="border-radius:1rem;margin-bottom:2rem;">
        <template #title>
          <div style="display:flex;align-items:center;gap:0.5rem;">
            <i class="pi pi-users" style="font-size:1.25rem;color:var(--p-primary-500);" />
            <h3 class="form-section-title" style="margin:0;">
              Parent Details
            </h3>
          </div>
        </template>
        <template #content>
          <div class="form-grid" style="gap:1.5rem;">
            <div class="form-field-detail">
              <label class="form-detail-label">Father's Name</label>
              <p class="form-detail-value">
                {{ person.fatherName || '-' }}
              </p>
            </div>
            <div class="form-field-detail">
              <label class="form-detail-label">Father's Phone</label>
              <p class="form-detail-value">
                {{ person.fatherPhone || '-' }}
              </p>
            </div>
            <div class="form-field-detail">
              <label class="form-detail-label">Mother's Name</label>
              <p class="form-detail-value">
                {{ person.motherName || '-' }}
              </p>
            </div>
            <div class="form-field-detail">
              <label class="form-detail-label">Mother's Phone</label>
              <p class="form-detail-value">
                {{ person.motherPhone || '-' }}
              </p>
            </div>
          </div>
        </template>
      </Card>

      <!-- Education -->
      <Card style="border-radius:1rem;margin-bottom:2rem;">
        <template #title>
          <div style="display:flex;align-items:center;gap:0.5rem;">
            <i class="pi pi-graduation-cap" style="font-size:1.25rem;color:var(--p-primary-500);" />
            <h3 class="form-section-title" style="margin:0;">
              Education
            </h3>
            <Tag :value="person.currentlyStudying ? 'Currently Studying' : 'Not Studying'" :severity="person.currentlyStudying ? 'success' : 'secondary'" style="margin-left:auto;" />
          </div>
        </template>
        <template #content>
          <div v-if="person.educationDetails && person.educationDetails.length > 0" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1rem;">
            <div v-for="(edu, index) in person.educationDetails" :key="index" style="background:var(--p-surface-100);padding:1rem;border-radius:0.75rem;">
              <h4 style="margin:0 0 0.75rem 0;color:var(--p-text-color);font-size:1rem;">
                {{ edu.level }}
              </h4>
              <div style="display:grid;gap:0.25rem;font-size:0.875rem;">
                <div v-if="edu.institution">
                  <span class="form-detail-label">Institution:</span> {{ edu.institution }}
                </div>
                <div v-if="edu.course">
                  <span class="form-detail-label">Course:</span> {{ edu.course }}
                </div>
                <div v-if="edu.yearOfStudy">
                  <span class="form-detail-label">Year of Study:</span> {{ edu.yearOfStudy }}
                </div>
                <div v-if="edu.yearCompleted">
                  <span class="form-detail-label">Completed:</span> {{ edu.yearCompleted }}
                </div>
                <div v-if="edu.percentage">
                  <span class="form-detail-label">Percentage:</span> {{ edu.percentage }}%
                </div>
              </div>
            </div>
          </div>
          <p v-else style="color:var(--p-text-muted-color);">
            No education details added.
          </p>
        </template>
      </Card>

      <!-- Activities & Skills -->
      <Card v-if="person.activities && person.activities.length > 0" style="border-radius:1rem;margin-bottom:2rem;">
        <template #title>
          <div style="display:flex;align-items:center;gap:0.5rem;">
            <i class="pi pi-star" style="font-size:1.25rem;color:var(--p-primary-500);" />
            <h3 class="form-section-title" style="margin:0;">
              Activities & Skills
            </h3>
            <Tag :value="String(person.activities.length)" style="margin-left:auto;" severity="info" />
          </div>
        </template>
        <template #content>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:1rem;">
            <div v-for="(activity, index) in person.activities" :key="index" style="background:var(--p-surface-100);padding:1rem;border-radius:0.75rem;">
              <h4 style="margin:0 0 0.5rem 0;color:var(--p-text-color);font-size:0.95rem;">
                {{ activity.name }}
              </h4>
              <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
                <Tag :value="categoryLabel(activity.type)" size="small" />
                <Tag v-if="activity.proficiency" :value="categoryLabel(activity.proficiency)" severity="info" size="small" />
              </div>
              <p v-if="activity.notes" style="margin:0.5rem 0 0;font-size:0.8rem;color:var(--p-text-muted-color);">
                {{ activity.notes }}
              </p>
            </div>
          </div>
        </template>
      </Card>

      <!-- Achievements -->
      <Card v-if="person.achievements && person.achievements.length > 0" style="border-radius:1rem;margin-bottom:2rem;">
        <template #title>
          <div style="display:flex;align-items:center;gap:0.5rem;">
            <i class="pi pi-trophy" style="font-size:1.25rem;color:var(--p-primary-500);" />
            <h3 class="form-section-title" style="margin:0;">
              Achievements & Awards
            </h3>
            <Tag :value="String(person.achievements.length)" style="margin-left:auto;" severity="warn" />
          </div>
        </template>
        <template #content>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1rem;">
            <div v-for="(ach, index) in person.achievements" :key="index" style="background:var(--p-surface-100);padding:1rem;border-radius:0.75rem;">
              <h4 style="margin:0 0 0.5rem 0;color:var(--p-text-color);font-size:0.95rem;">
                {{ ach.title }}
              </h4>
              <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:0.5rem;">
                <Tag :value="categoryLabel(ach.category)" size="small" />
                <Tag v-if="ach.level" :value="categoryLabel(ach.level)" severity="info" size="small" />
                <Tag v-if="ach.year" :value="String(ach.year)" severity="secondary" size="small" />
              </div>
              <p v-if="ach.description" style="margin:0;font-size:0.8rem;color:var(--p-text-muted-color);">
                {{ ach.description }}
              </p>
            </div>
          </div>
        </template>
      </Card>

      <!-- Interests & Goals -->
      <Card v-if="person.interests || person.careerGoal" style="border-radius:1rem;margin-bottom:2rem;">
        <template #title>
          <div style="display:flex;align-items:center;gap:0.5rem;">
            <i class="pi pi-compass" style="font-size:1.25rem;color:var(--p-primary-500);" />
            <h3 class="form-section-title" style="margin:0;">
              Interests & Goals
            </h3>
          </div>
        </template>
        <template #content>
          <div class="form-grid" style="gap:1.5rem;">
            <div v-if="person.interests" class="form-field-detail" style="grid-column:span 2;">
              <label class="form-detail-label">Interests / Hobbies</label>
              <p class="form-detail-value" style="white-space:pre-wrap;">
                {{ person.interests }}
              </p>
            </div>
            <div v-if="person.careerGoal" class="form-field-detail" style="grid-column:span 2;">
              <label class="form-detail-label">Career Goal / Aspiration</label>
              <p class="form-detail-value">
                {{ person.careerGoal }}
              </p>
            </div>
          </div>
        </template>
      </Card>

      <!-- Notes -->
      <Card v-if="person.notes" style="border-radius:1rem;margin-bottom:2rem;">
        <template #title>
          <div style="display:flex;align-items:center;gap:0.5rem;">
            <i class="pi pi-comment" style="font-size:1.25rem;color:var(--p-primary-500);" />
            <h3 class="form-section-title" style="margin:0;">
              Notes
            </h3>
          </div>
        </template>
        <template #content>
          <p style="white-space:pre-wrap;font-size:0.95rem;color:var(--p-text-color);">
            {{ person.notes }}
          </p>
        </template>
      </Card>
    </template>
  </div>
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
