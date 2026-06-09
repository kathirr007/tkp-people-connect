<script setup lang="ts">
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import { useConfirm } from 'primevue/useconfirm'

definePageMeta({ layout: 'dashboard' })

const { canEdit, isAdmin } = useAuth()
const { showSuccess, showApiError } = useToastMessages()
const confirm = useConfirm()

const filters = ref({
  page: 1,
  limit: 20,
  search: '',
  sortBy: 'createdAt',
  sortOrder: 'desc' as const,
})

const { data, isPending } = usePeopleList(filters)
const deleteMutation = useDeletePerson()

const searchInput = ref('')
let searchTimeout: ReturnType<typeof setTimeout>

function onSearchInput() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    filters.value = { ...filters.value, search: searchInput.value, page: 1 }
  }, 400)
}

function onPage(event: { page: number, rows: number }) {
  filters.value = { ...filters.value, page: event.page + 1, limit: event.rows }
}

function onSort(event: { sortField: string | undefined, sortOrder: number | null }) {
  if (event.sortField) {
    filters.value = {
      ...filters.value,
      sortBy: event.sortField,
      sortOrder: event.sortOrder === 1 ? 'asc' : 'desc',
    }
  }
}

function confirmDelete(id: string, name: string) {
  confirm.require({
    message: `Are you sure you want to delete "${name}"?`,
    header: 'Confirm Delete',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Cancel',
    acceptLabel: 'Delete',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await deleteMutation.mutateAsync(id)
        showSuccess('Deleted', `${name} has been removed.`)
      }
      catch (e) {
        showApiError(e)
      }
    },
  })
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1>People Directory</h1>
      <div style="display: flex; gap: 0.75rem; align-items: center;">
        <span class="p-input-icon-left">
          <i class="pi pi-search" />
          <InputText
            v-model="searchInput"
            placeholder="Search people..."
            @input="onSearchInput"
          />
        </span>
        <Button
          v-if="canEdit"
          label="Add Person"
          icon="pi pi-plus"
          @click="navigateTo('/people/add')"
        />
        <Button
          label="Export"
          icon="pi pi-download"
          severity="secondary"
          outlined
          @click="navigateTo('/api/people/export', { external: true })"
        />
      </div>
    </div>

    <DataTable
      :value="data?.data || []"
      :loading="isPending"
      lazy
      paginator
      :rows="filters.limit"
      :total-records="data?.meta?.total || 0"
      :rows-per-page-options="[10, 20, 50]"
      striped-rows
      removable-sort
      @page="onPage($event)"
      @sort="onSort($event)"
    >
      <Column field="firstName" header="First Name" sortable />
      <Column field="lastName" header="Last Name" sortable />
      <Column field="email" header="Email" />
      <Column field="organization" header="Organization" sortable />
      <Column field="designation" header="Designation" />
      <Column field="isActive" header="Status">
        <template #body="{ data: row }">
          <Tag :value="row.isActive ? 'Active' : 'Inactive'" :severity="row.isActive ? 'success' : 'danger'" />
        </template>
      </Column>
      <Column header="Actions" style="width: 10rem;">
        <template #body="{ data: row }">
          <div style="display: flex; gap: 0.25rem;">
            <Button
              icon="pi pi-eye"
              text
              rounded
              size="small"
              @click="navigateTo(`/people/${row._id}`)"
            />
            <Button
              v-if="canEdit"
              icon="pi pi-pencil"
              text
              rounded
              size="small"
              severity="info"
              @click="navigateTo(`/people/${row._id}/edit`)"
            />
            <Button
              v-if="isAdmin"
              icon="pi pi-trash"
              text
              rounded
              size="small"
              severity="danger"
              @click="confirmDelete(row._id, `${row.firstName} ${row.lastName}`)"
            />
          </div>
        </template>
      </Column>
      <template #empty>
        <div style="text-align: center; padding: 2rem; color: var(--p-text-muted-color);">
          No people found. {{ canEdit ? 'Click "Add Person" to get started.' : '' }}
        </div>
      </template>
    </DataTable>
  </div>
</template>
