<script setup lang="ts">
import type { FileUploadSelectEvent } from 'primevue/fileupload'

definePageMeta({
  layout: 'dashboard',
  middleware: ['role'],
  requiredRole: 'admin',
})

const { showSuccess, showApiError } = useToastMessages()
const uploadMutation = useBulkUpload()

const selectedFile = ref<File | null>(null)
const results = ref<{ total: number, success: number, failed: number, errors: string[] } | null>(null)

function onSelect(event: FileUploadSelectEvent) {
  selectedFile.value = event.files[0] || null
  results.value = null
}

function onClear() {
  selectedFile.value = null
  results.value = null
}

async function handleUpload() {
  if (!selectedFile.value)
    return

  const formData = new FormData()
  formData.append('file', selectedFile.value)

  try {
    const response = await uploadMutation.mutateAsync(formData)
    results.value = response.results
    showSuccess('Upload Complete', `${response.results.success} records imported successfully.`)
  }
  catch (e) {
    showApiError(e)
  }
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1>Bulk Upload</h1>
    </div>

    <Card>
      <template #title>
        Upload People Data
      </template>
      <template #subtitle>
        Upload a CSV, Excel (.xlsx), or JSON file to import multiple people at once.
      </template>
      <template #content>
        <FileUpload
          mode="advanced"
          :multiple="false"
          accept=".csv,.xlsx,.xls,.json"
          :max-file-size="10000000"
          :auto="false"
          choose-label="Choose File"
          :show-upload-button="false"
          :show-cancel-button="false"
          @select="onSelect"
          @clear="onClear"
        >
          <template #empty>
            <div style="text-align: center; padding: 2rem;">
              <i class="pi pi-cloud-upload" style="font-size: 3rem; color: var(--p-text-muted-color);" />
              <p style="margin-top: 1rem; color: var(--p-text-muted-color);">
                Drag and drop a file here, or click to browse.
              </p>
              <p style="font-size: 0.75rem; color: var(--p-text-muted-color);">
                Supported: CSV, Excel (.xlsx), JSON (max 10MB)
              </p>
            </div>
          </template>
        </FileUpload>

        <div v-if="selectedFile" style="margin-top: 1.5rem;">
          <Button
            label="Upload & Import"
            icon="pi pi-upload"
            :loading="uploadMutation.isPending.value"
            @click="handleUpload"
          />
        </div>

        <ProgressBar
          v-if="uploadMutation.isPending.value"
          mode="indeterminate"
          style="margin-top: 1rem;"
        />

        <div v-if="results" style="margin-top: 1.5rem;">
          <Message severity="info" :closable="false">
            Upload complete: {{ results.total }} total, {{ results.success }} imported, {{ results.failed }} failed.
          </Message>

          <div v-if="results.errors.length" style="margin-top: 1rem;">
            <h4 style="margin-bottom: 0.5rem;">Errors:</h4>
            <div style="max-height: 12rem; overflow-y: auto; background: var(--p-surface-50); padding: 1rem; border-radius: 0.5rem; font-size: 0.8rem;">
              <p v-for="(err, i) in results.errors" :key="i" style="margin-bottom: 0.25rem; color: var(--p-red-500);">
                {{ err }}
              </p>
            </div>
          </div>
        </div>

        <div style="margin-top: 2rem; padding: 1.5rem; background: var(--p-surface-50); border-radius: 0.5rem;">
          <h4 style="margin-bottom: 0.75rem;">Expected Column Headers</h4>
          <p style="font-size: 0.875rem; color: var(--p-text-muted-color);">
            <strong>Required:</strong> First Name, Last Name<br>
            <strong>Optional:</strong> Email, Phone, Organization, Designation, Department, Notes, Tags, Street, City, State, Zip Code, Country
          </p>
        </div>
      </template>
    </Card>
  </div>
</template>
