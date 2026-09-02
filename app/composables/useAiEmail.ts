import type { AiEmailDraft, AiEmailType } from '~~/shared/types/ai'

export function useAiEmail() {
  const draft = ref<AiEmailDraft | null>(null)
  const isGenerating = ref(false)
  const isSending = ref(false)
  const error = ref<string | null>(null)

  async function generate(
    personId: string,
    personType: 'people' | 'youth',
    emailType: AiEmailType,
    customContext?: string,
    subject?: string,
  ) {
    isGenerating.value = true
    error.value = null
    draft.value = null

    try {
      const response = await $fetch<AiEmailDraft & { sent?: boolean }>('/api/ai/email-generate', {
        method: 'POST',
        body: { personId, personType, emailType, customContext, subject },
      })
      draft.value = {
        subject: response.subject,
        body: response.body,
        htmlBody: response.htmlBody,
      }
    }
    catch (e: unknown) {
      const err = e as { data?: { message?: string }, message?: string }
      error.value = err?.data?.message || err?.message || 'Email generation failed'
    }
    finally {
      isGenerating.value = false
    }
  }

  async function send(to: string, subject: string, htmlBody: string) {
    isSending.value = true
    error.value = null

    try {
      await $fetch<{ sent: boolean }>('/api/ai/email-generate', {
        method: 'POST',
        body: { send: true, to, subject, htmlBody },
      })
      return true
    }
    catch (e: unknown) {
      const err = e as { data?: { message?: string }, message?: string }
      error.value = err?.data?.message || err?.message || 'Failed to send email'
      return false
    }
    finally {
      isSending.value = false
    }
  }

  function clearDraft() {
    draft.value = null
    error.value = null
  }

  return {
    draft,
    isGenerating,
    isSending,
    error,
    generate,
    send,
    clearDraft,
  }
}
