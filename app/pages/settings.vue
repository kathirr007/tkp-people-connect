<script setup lang="ts">
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import { ROLE_LABELS, type Role } from '~~/shared/utils/roles'

definePageMeta({ layout: 'dashboard' })

const { user } = useAuth()
const { showInfo } = useToastMessages()

function copyInfo() {
  showInfo('Profile info is read-only', 'Contact an administrator to change your account details.')
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1>Settings</h1>
    </div>

    <Card>
      <template #title>
        Profile Information
      </template>
      <template #content>
        <div class="form-grid">
          <div class="form-field">
            <label>First Name</label>
            <InputText :model-value="user?.firstName" disabled fluid />
          </div>
          <div class="form-field">
            <label>Last Name</label>
            <InputText :model-value="user?.lastName" disabled fluid />
          </div>
          <div class="form-field">
            <label>Email</label>
            <InputText :model-value="user?.email" disabled fluid />
          </div>
          <div class="form-field">
            <label>Role</label>
            <div>
              <Tag :value="ROLE_LABELS[(user?.role || 'viewer') as Role]" severity="info" />
            </div>
          </div>
        </div>
        <div class="form-actions">
          <Button
            label="Request Changes"
            severity="secondary"
            @click="copyInfo"
          />
        </div>
      </template>
    </Card>
  </div>
</template>
