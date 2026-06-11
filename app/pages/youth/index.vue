<script setup lang="ts">
import type { FileUploadSelectEvent } from 'primevue/fileupload'
import { useConfirm } from 'primevue/useconfirm'

definePageMeta({ layout: 'dashboard' })

const { canEdit, isAdmin } = useAuth()
const { showSuccess, showApiError } = useToastMessages()
const confirm = useConfirm()
const uploadMutation = useYouthBulkUpload()

const actionsMenu = ref()
const actionsMenuVisible = ref(false)
const { isAuthenticated } = useAuth()

const importDialogVisible = ref(false)
const importFile = ref<File | null>(null)
const importResults = ref<{ total: number, success: number, failed: number, errors: string[] } | null>(null)

const actionsMenuItems = computed(() => {
  const items = []
  if (canEdit.value) {
    items.push({ label: 'Add Youth', icon: 'pi pi-plus', command: () => navigateTo('/youth/add') })
  }
  if (isAdmin.value) {
    items.push({
      label: 'Import',
      icon: 'pi pi-upload',
      command: () => { importDialogVisible.value = true },
    })
  }
  if (isAuthenticated.value) {
    items.push({ label: 'Export', icon: 'pi pi-download', command: () => navigateTo('/api/youth/export', { external: true }) })
  }
  return items
})

const filters = ref({
  page: 1,
  limit: 20,
  search: '',
  sortBy: 'createdAt',
  sortOrder: 'desc' as 'asc' | 'desc' | undefined,
  village: '',
})

const { data, isPending } = useYouthList(filters)
const deleteMutation = useDeleteYouth()

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

function onSort(event: { sortField: string | ((item: any) => string) | undefined, sortOrder: number | null | undefined }) {
  if (event.sortField && typeof event.sortField === 'string') {
    filters.value = {
      ...filters.value,
      sortBy: event.sortField,
      sortOrder: event.sortOrder === 1 ? 'asc' : 'desc',
    }
  }
}

function onImportSelect(event: FileUploadSelectEvent) {
  importFile.value = event.files[0] || null
  importResults.value = null
}

function onImportClear() {
  importFile.value = null
  importResults.value = null
}

async function handleImport() {
  if (!importFile.value)
    return

  const formData = new FormData()
  formData.append('file', importFile.value)

  try {
    const response = await uploadMutation.mutateAsync(formData)
    importResults.value = response.results
    showSuccess('Import Complete', `${response.results.success} records imported successfully.`)
  }
  catch (e) {
    showApiError(e)
  }
}

function closeImportDialog() {
  importDialogVisible.value = false
  importFile.value = null
  importResults.value = null
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
  <div class="page-container">
    <div class="page-header" role="search">
      <h1>Youth Directory</h1>
      <div style="display: flex; gap: 0.75rem; align-items: center;">
        <IconField>
          <InputIcon class="pi pi-search" />
          <InputText
            v-model="searchInput"
            placeholder="Search youth..."
            aria-label="Search youth by name, village, or phone"
            @input="onSearchInput"
          />
        </IconField>
        <Button
          v-if="actionsMenuItems.length"
          :icon="actionsMenuVisible ? 'pi pi-times' : 'pi pi-ellipsis-v'"
          :aria-label="actionsMenuVisible ? 'Close menu' : 'Open actions menu'"
          rounded
          text
          @click="actionsMenu.toggle($event)"
        />
        <Menu
          ref="actionsMenu"
          v-model:visible="actionsMenuVisible"
          :model="actionsMenuItems"
          popup
          :aria-label="actionsMenuVisible ? 'Youth actions menu' : 'Youth actions'"
        />
      </div>
    </div>

    <div aria-live="polite">
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
        aria-label="Youth directory table"
        @page="onPage($event)"
        @sort="onSort($event)"
      >
        <Column field="firstName" header="First Name" sortable />
        <Column field="lastName" header="Last Name" sortable />
        <Column field="village" header="Village" sortable />
        <Column field="phone" header="Phone" />
        <Column field="fatherName" header="Father's Name" />
        <Column field="currentlyStudying" header="Studying">
          <template #body="{ data: row }">
            <Tag :value="row.currentlyStudying ? 'Yes' : 'No'" :severity="row.currentlyStudying ? 'success' : 'secondary'" />
          </template>
        </Column>
        <Column field="isActive" header="Status">
          <template #body="{ data: row }">
            <Tag :value="row.isActive ? 'Active' : 'Inactive'" :severity="row.isActive ? 'info' : 'danger'" />
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
                @click="navigateTo(`/youth/${row._id}`)"
              />
              <Button
                v-if="canEdit"
                icon="pi pi-pencil"
                text
                rounded
                size="small"
                severity="info"
                @click="navigateTo(`/youth/${row._id}/edit`)"
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
            No youth records found. {{ canEdit ? 'Click "Add Youth" to get started.' : '' }}
          </div>
        </template>
      </DataTable>

      <Dialog
        v-model:visible="importDialogVisible"
        header="Import Youth Records"
        modal
        :style="{ width: '32rem' }"
        @hide="closeImportDialog"
      >
        <FileUpload
          mode="advanced"
          :multiple="false"
          accept=".csv,.xlsx,.xls,.json"
          :max-file-size="10000000"
          :auto="false"
          choose-label="Choose File"
          :show-upload-button="false"
          :show-cancel-button="false"
          @select="onImportSelect"
          @clear="onImportClear"
        >
          <template #empty>
            <div style="text-align: center; padding: 1.5rem;">
              <i class="pi pi-cloud-upload" style="font-size: 2rem; color: var(--p-text-muted-color);" />
              <p style="margin-top: 0.75rem; font-size: 0.875rem; color: var(--p-text-muted-color);">
                Drag and drop or click to browse. Supported: CSV, Excel, JSON (max 10MB)
              </p>
            </div>
          </template>
        </FileUpload>

        <div v-if="importFile" style="margin-top: 1rem;">
          <Button
            label="Upload & Import"
            icon="pi pi-upload"
            :loading="uploadMutation.isPending.value"
            @click="handleImport"
          />
        </div>

        <Message v-if="importResults" severity="info" :closable="false" style="margin-top: 1rem;">
          {{ importResults.total }} total, {{ importResults.success }} imported, {{ importResults.failed }} failed.
        </Message>

        <div v-if="importResults?.errors.length" style="margin-top: 0.75rem; max-height: 10rem; overflow-y: auto; background: var(--p-surface-50); padding: 0.75rem; border-radius: 0.5rem; font-size: 0.75rem;">
          <p v-for="(err, i) in importResults.errors" :key="i" style="margin-bottom: 0.25rem; color: var(--p-red-500);">
            {{ err }}
          </p>
        </div>
      </Dialog>
    </div>
  </div>
</template>
