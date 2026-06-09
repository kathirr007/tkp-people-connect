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
      <div style="display: flex; gap: 0.75rem;">
        <Button
          label="Back"
          icon="pi pi-arrow-left"
          severity="secondary"
          outlined
          @click="navigateTo('/people')"
        />
        <Button
          v-if="canEdit && person"
          label="Edit"
          icon="pi pi-pencil"
          @click="navigateTo(`/people/${id}/edit`)"
        />
      </div>
    </div>

    <div v-if="isPending">
      <Card>
        <template #content>
          <Skeleton v-for="i in 8" :key="i" height="1.5rem" class="mb-3" />
        </template>
      </Card>
    </div>

    <Card v-else-if="person">
      <template #content>
        <div class="form-grid">
          <div class="form-field">
            <label>First Name</label>
            <p>{{ person.firstName }}</p>
          </div>
          <div class="form-field">
            <label>Last Name</label>
            <p>{{ person.lastName }}</p>
          </div>
          <div class="form-field">
            <label>Email</label>
            <p>{{ person.email || '-' }}</p>
          </div>
          <div class="form-field">
            <label>Phone</label>
            <p>{{ person.phone || '-' }}</p>
          </div>
          <div class="form-field">
            <label>Organization</label>
            <p>{{ person.organization || '-' }}</p>
          </div>
          <div class="form-field">
            <label>Designation</label>
            <p>{{ person.designation || '-' }}</p>
          </div>
          <div class="form-field">
            <label>Department</label>
            <p>{{ person.department || '-' }}</p>
          </div>
          <div class="form-field">
            <label>Status</label>
            <Tag :value="person.isActive ? 'Active' : 'Inactive'" :severity="person.isActive ? 'success' : 'danger'" />
          </div>
        </div>

        <div v-if="person.address" style="margin-top: 1.5rem;">
          <h3 style="font-size: 1rem; font-weight: 600; margin-bottom: 0.75rem;">Address</h3>
          <div class="form-grid">
            <div class="form-field">
              <label>Street</label>
              <p>{{ person.address.street || '-' }}</p>
            </div>
            <div class="form-field">
              <label>City</label>
              <p>{{ person.address.city || '-' }}</p>
            </div>
            <div class="form-field">
              <label>State</label>
              <p>{{ person.address.state || '-' }}</p>
            </div>
            <div class="form-field">
              <label>Zip Code</label>
              <p>{{ person.address.zipCode || '-' }}</p>
            </div>
            <div class="form-field">
              <label>Country</label>
              <p>{{ person.address.country || '-' }}</p>
            </div>
          </div>
        </div>

        <div v-if="person.tags?.length" style="margin-top: 1.5rem;">
          <h3 style="font-size: 1rem; font-weight: 600; margin-bottom: 0.75rem;">Tags</h3>
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <Tag v-for="tag in person.tags" :key="tag" :value="tag" severity="info" />
          </div>
        </div>

        <div v-if="person.notes" style="margin-top: 1.5rem;">
          <h3 style="font-size: 1rem; font-weight: 600; margin-bottom: 0.75rem;">Notes</h3>
          <p style="white-space: pre-wrap;">{{ person.notes }}</p>
        </div>
      </template>
    </Card>
  </div>
</template>
