<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

const route = useRoute()
const { canEdit } = useAuth()
const id = computed(() => route.params.id as string)
const { data, isPending } = usePerson(id)
const person = computed(() => data.value?.data)
</script>

<template>
  <div>
    <div class="page-header">
      <h1>Person Details</h1>
      <div style="display:flex;gap:0.75rem;">
        <Button label="Back" icon="pi pi-arrow-left" severity="secondary" outlined @click="navigateTo('/people')" />
        <Button v-if="canEdit && person" label="Edit" icon="pi pi-pencil" @click="navigateTo(`/people/${id}/edit`)" />
      </div>
    </div>

    <div v-if="isPending">
      <Card><template #content><Skeleton v-for="i in 8" :key="i" height="1.5rem" class="mb-3" /></template></Card>
    </div>

    <template v-else-if="person">
      <!-- Personal Information -->
      <Card class="mb-4">
        <template #title>Personal Information</template>
        <template #content>
          <div class="form-grid">
            <div class="form-field">
              <label>Full Name</label>
              <p>{{ person.firstName }} {{ person.lastName }}</p>
            </div>
            <div class="form-field">
              <label>Gender</label>
              <p>{{ person.gender || '-' }}</p>
            </div>
            <div class="form-field">
              <label>Date of Birth</label>
              <p>{{ person.dateOfBirth || '-' }}</p>
            </div>
            <div class="form-field">
              <label>Phone</label>
              <p>{{ person.phone || '-' }}</p>
            </div>
            <div class="form-field">
              <label>Email</label>
              <p>{{ person.email || '-' }}</p>
            </div>
            <div class="form-field">
              <label>Status</label>
              <div style="display:flex;gap:0.5rem;">
                <Tag :value="person.isAlive ? 'Alive' : 'Deceased'" :severity="person.isAlive ? 'success' : 'secondary'" />
                <Tag :value="person.isActive ? 'Active' : 'Inactive'" :severity="person.isActive ? 'info' : 'danger'" />
              </div>
            </div>
          </div>
        </template>
      </Card>

      <!-- Location -->
      <Card class="mb-4">
        <template #title>Location</template>
        <template #content>
          <div class="form-grid">
            <div class="form-field">
              <label>Village</label>
              <p>{{ person.village || '-' }}</p>
            </div>
            <div class="form-field">
              <label>Ward</label>
              <p>{{ person.ward || '-' }}</p>
            </div>
            <div class="form-field" style="grid-column:span 2;">
              <label>Address</label>
              <p>{{ person.address || '-' }}</p>
            </div>
          </div>
        </template>
      </Card>

      <!-- Parent Details -->
      <Card class="mb-4">
        <template #title>Parent Details</template>
        <template #content>
          <div class="form-grid">
            <div class="form-field">
              <label>Father's Name</label>
              <p>{{ person.fatherName || '-' }}</p>
            </div>
            <div class="form-field">
              <label>Father's Phone</label>
              <p>{{ person.fatherPhone || '-' }}</p>
            </div>
            <div class="form-field">
              <label>Mother's Name</label>
              <p>{{ person.motherName || '-' }}</p>
            </div>
            <div class="form-field">
              <label>Mother's Phone</label>
              <p>{{ person.motherPhone || '-' }}</p>
            </div>
          </div>
        </template>
      </Card>

      <!-- Own Family -->
      <Card class="mb-4">
        <template #title>Own Family</template>
        <template #content>
          <div class="form-grid">
            <div class="form-field">
              <label>Marital Status</label>
              <p>{{ person.maritalStatus || '-' }}</p>
            </div>
            <div class="form-field">
              <label>Marriage Year</label>
              <p>{{ person.marriageYear || '-' }}</p>
            </div>
            <div class="form-field">
              <label>Spouse's Name</label>
              <p>{{ person.spouseName || '-' }}</p>
            </div>
            <div class="form-field">
              <label>Spouse's Phone</label>
              <p>{{ person.spousePhone || '-' }}</p>
            </div>
            <div class="form-field">
              <label>Number of Children</label>
              <p>{{ person.numberOfChildren ?? '-' }}</p>
            </div>
          </div>
        </template>
      </Card>

      <!-- Notes -->
      <Card v-if="person.notes">
        <template #title>Notes</template>
        <template #content>
          <p style="white-space:pre-wrap;">{{ person.notes }}</p>
        </template>
      </Card>
    </template>
  </div>
</template>
