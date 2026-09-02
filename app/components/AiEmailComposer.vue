<script setup lang="ts">
import type { AiEmailType } from '~~/shared/types/ai'

const props = defineProps<{
  personId: string
  personType: 'people' | 'youth'
  personName: string
  visible: boolean
}>()

const emit = defineEmits<{
  close: []
  sent: []
}>()

const { draft, isGenerating, isSending, error, generate, send, clearDraft } = useAiEmail()
const { showSuccess, showError } = useToastMessages()

const emailType = ref<AiEmailType>('welcome')
const customContext = ref('')
const customSubject = ref('')
const recipientEmail = ref('')

const emailTypeOptions = [
  { label: 'Welcome', value: 'welcome', icon: 'pi pi-heart' },
  { label: 'Event Invitation', value: 'event', icon: 'pi pi-calendar' },
  { label: 'Follow-up', value: 'followup', icon: 'pi pi-comments' },
  { label: 'Custom', value: 'custom', icon: 'pi pi-pencil' },
]

const isDialogVisible = computed({
  get: () => props.visible,
  set: (val) => {
    if (!val) {
      clearDraft()
      emit('close')
    }
  },
})

async function handleGenerate() {
  await generate(
    props.personId,
    props.personType,
    emailType.value,
    emailType.value === 'custom' ? customContext.value : undefined,
    customSubject.value || undefined,
  )
}

async function handleSend() {
  if (!draft.value || !recipientEmail.value)
    return
  const success = await send(recipientEmail.value, draft.value.subject, draft.value.htmlBody)
  if (success) {
    showSuccess('Email Sent', `Email sent to ${recipientEmail.value}`)
    emit('sent')
    isDialogVisible.value = false
  }
  else {
    showError('Send Failed', error.value || 'Unknown error')
  }
}
</script>

<template>
  <Dialog
    v-model:visible="isDialogVisible" header="AI Email Composer" modal
    :style="{ width: '40rem' }" :closable="!isGenerating"
  >
    <div class="ai-email-composer">
      <div class="ai-email-to">
        <label for="email-recipient">Recipient Email</label>
        <InputText
          id="email-recipient" v-model="recipientEmail" placeholder="recipient@example.com"
          fluid
        />
      </div>

      <div class="ai-email-type">
        <label>Email Type</label>
        <SelectButton
          v-model="emailType" :options="emailTypeOptions" option-label="label"
          option-value="value" :allow-empty="false"
        />
      </div>

      <div v-if="emailType === 'custom'" class="ai-email-custom">
        <label for="email-context">Context / Instructions</label>
        <Textarea
          id="email-context" v-model="customContext"
          placeholder="Describe what the email should be about..." rows="3" fluid
        />
      </div>

      <div class="ai-email-custom">
        <label for="email-subject">Custom Subject (optional)</label>
        <InputText
          id="email-subject" v-model="customSubject"
          placeholder="Leave blank for AI-generated subject" fluid
        />
      </div>

      <Button
        label="Generate Email" icon="pi pi-sparkles" :loading="isGenerating"
        :disabled="isGenerating" @click="handleGenerate"
      />

      <div v-if="error" class="ai-email-error">
        <Message severity="error" :closable="false">
          {{ error }}
        </Message>
      </div>

      <div v-if="draft" class="ai-email-preview">
        <h4>Email Preview</h4>
        <div class="ai-email-preview-subject">
          <strong>Subject:</strong> {{ draft.subject }}
        </div>
        <Textarea v-model="draft.body" rows="8" fluid class="ai-email-body" />
        <div class="ai-email-preview-html">
          <strong>HTML Preview:</strong>
          <div class="ai-email-html-preview" v-html="draft.htmlBody" />
        </div>
      </div>
    </div>

    <template #footer>
      <Button label="Cancel" severity="secondary" text @click="isDialogVisible = false" />
      <Button
        v-if="draft" label="Send Email" icon="pi pi-send" :loading="isSending"
        :disabled="isSending || !recipientEmail" @click="handleSend"
      />
    </template>
  </Dialog>
</template>

<style scoped>
.ai-email-composer {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ai-email-to label,
.ai-email-type label,
.ai-email-custom label {
  display: block;
  margin-bottom: 0.25rem;
  font-weight: 600;
  font-size: 0.875rem;
}

.ai-email-type {
  display: flex;
  flex-direction: column;
}

.ai-email-custom {
  display: flex;
  flex-direction: column;
}

.ai-email-error {
  margin-top: 0.5rem;
}

.ai-email-preview {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--p-border-color);
}

.ai-email-preview h4 {
  margin: 0 0 0.75rem;
  font-size: 0.875rem;
}

.ai-email-preview-subject {
  padding: 0.5rem;
  background: var(--p-surface-50);
  border-radius: 0.5rem;
  margin-bottom: 0.75rem;
}

.ai-email-body {
  font-family: monospace;
  font-size: 0.8rem;
}

.ai-email-preview-html {
  margin-top: 0.75rem;
}

.ai-email-preview-html strong {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.8rem;
}

.ai-email-html-preview {
  padding: 1rem;
  background: var(--p-surface-50);
  border: 1px solid var(--p-border-color);
  border-radius: 0.5rem;
  font-size: 0.85rem;
  line-height: 1.6;
}
</style>
