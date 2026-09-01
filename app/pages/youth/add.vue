<script setup lang="ts">
import type { FileUploadSelectEvent } from 'primevue/fileupload'

definePageMeta({
  layout: 'dashboard',
  middleware: ['role'],
  requiredRole: 'user',
})

const { isAdmin } = useAuth()
const { showSuccess, showApiError } = useToastMessages()
const uploadMutation = useYouthBulkUpload()

const importDialogVisible = ref(false)
const importFile = ref<File | null>(null)
const importResults = ref<{ total: number, success: number, failed: number, errors: string[] } | null>(null)

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
</script>

<template>
  <div class="page-container">
    <div class="page-header" role="search">
      <h1>Add Youth</h1>
      <Button
        v-if="isAdmin"
        label="Import from File"
        icon="pi pi-upload"
        severity="secondary"
        outlined
        aria-label="Import youth records from file"
        @click="importDialogVisible = true"
      />
    </div>
    <YouthForm mode="create" @success="navigateTo('/youth')" />

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
</template>
