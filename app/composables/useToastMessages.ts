import { useToast } from 'primevue/usetoast'

export function useToastMessages() {
  const toast = useToast()

  function showSuccess(message: string, detail?: string) {
    toast.add({
      severity: 'success',
      summary: message,
      detail,
      life: 3000,
    })
  }

  function showError(message: string, detail?: string) {
    toast.add({
      severity: 'error',
      summary: message,
      detail,
      life: 5000,
    })
  }

  function showInfo(message: string, detail?: string) {
    toast.add({
      severity: 'info',
      summary: message,
      detail,
      life: 3000,
    })
  }

  function showWarn(message: string, detail?: string) {
    toast.add({
      severity: 'warn',
      summary: message,
      detail,
      life: 4000,
    })
  }

  function showApiError(error: unknown) {
    const err = error as { data?: { message?: string }, message?: string }
    const message = err?.data?.message || err?.message || 'An unexpected error occurred'
    showError('Error', message)
  }

  return {
    showSuccess,
    showError,
    showInfo,
    showWarn,
    showApiError,
  }
}
