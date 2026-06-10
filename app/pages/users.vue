<script setup lang="ts">
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { ROLE_LABELS, type Role } from '~~/shared/utils/roles'

definePageMeta({
  layout: 'dashboard',
  middleware: ['role'],
  requiredRole: 'admin',
})

const { showSuccess, showApiError } = useToastMessages()
const queryClient = useQueryClient()

const page = ref(1)
const search = ref('')
let searchTimeout: ReturnType<typeof setTimeout>

const { data, isPending } = useQuery({
  queryKey: ['users', page, search],
  queryFn: () => $fetch<{ data: Array<{ _id: string, email: string, firstName: string, lastName: string, role: Role, isVerified: boolean, createdAt: string }>, meta: { total: number, page: number, limit: number, totalPages: number } }>('/api/users', {
    query: { page: page.value, search: search.value },
  }),
})

const updateRoleMutation = useMutation({
  mutationFn: ({ id, role }: { id: string, role: string }) =>
    $fetch(`/api/users/${id}`, { method: 'PUT', body: { role } }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['users'] })
    showSuccess('Role updated successfully')
  },
  onError: (e) => {
    showApiError(e)
  },
})

const handleRoleMutation = (id: string, role: string) => {
  updateRoleMutation.mutate({ id, role })
}

const roleOptions = [
  { label: 'Admin', value: 'admin' },
  { label: 'User', value: 'user' },
  { label: 'Viewer', value: 'viewer' },
]

function onSearchInput() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    page.value = 1
  }, 400)
}

function getRoleSeverity(role: string) {
  if (role === 'admin')
    return 'danger'
  if (role === 'user')
    return 'info'
  return 'secondary'
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1>User Management</h1>
      <InputText
        v-model="search"
        placeholder="Search users..."
        @input="onSearchInput"
      />
    </div>

    <DataTable
      :value="data?.data || []"
      :loading="isPending"
      lazy
      paginator
      :rows="20"
      :total-records="data?.meta?.total || 0"
      striped-rows
      @page="(e: { page: number }) => page = e.page + 1"
    >
      <Column header="Name">
        <template #body="{ data: row }">
          {{ row.firstName }} {{ row.lastName }}
        </template>
      </Column>
      <Column field="email" header="Email" />
      <Column field="role" header="Role">
        <template #body="{ data: row }">
          <Tag :value="ROLE_LABELS[row.role as Role]" :severity="getRoleSeverity(row.role)" />
        </template>
      </Column>
      <Column field="isVerified" header="Verified">
        <template #body="{ data: row }">
          <Tag :value="row.isVerified ? 'Yes' : 'No'" :severity="row.isVerified ? 'success' : 'warn'" />
        </template>
      </Column>
      <Column header="Change Role" style="width: 12rem;">
        <template #body="{ data: row }">
          <Select
            :model-value="row.role"
            :options="roleOptions"
            option-label="label"
            option-value="value"
            placeholder="Select role"
            size="small"
            @update:model-value="(val: string) => handleRoleMutation(row.id, val)"
          />
        </template>
      </Column>
      <Column field="createdAt" header="Joined">
        <template #body="{ data: row }">
          {{ new Date(row.createdAt).toLocaleDateString() }}
        </template>
      </Column>
    </DataTable>
  </div>
</template>
