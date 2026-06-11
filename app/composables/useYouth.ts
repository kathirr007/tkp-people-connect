import type { PaginatedResponse, Youth, YouthFormData } from '~~/shared/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'

export interface YouthFilters {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  village?: string
  isActive?: string
  currentlyStudying?: string
}

export function useYouthList(filters: Ref<YouthFilters>) {
  return useQuery({
    queryKey: ['youth', filters],
    queryFn: () =>
      $fetch<PaginatedResponse<Youth>>('/api/youth', {
        query: filters.value,
      }),
  })
}

export function useYouthRecord(id: Ref<string>) {
  return useQuery({
    queryKey: ['youth-record', id],
    queryFn: () => $fetch<{ data: Youth }>(`/api/youth/${id.value}`),
    enabled: computed(() => !!id.value),
  })
}

export function useCreateYouth() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: YouthFormData) =>
      $fetch('/api/youth', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['youth'] })
    },
  })
}

export function useUpdateYouth() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: YouthFormData }) =>
      $fetch(`/api/youth/${id}`, { method: 'PUT', body: data }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['youth'] })
      queryClient.invalidateQueries({ queryKey: ['youth-record', variables.id] })
    },
  })
}

export function useDeleteYouth() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      $fetch(`/api/youth/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['youth'] })
    },
  })
}

export function useYouthBulkUpload() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (formData: FormData) =>
      $fetch<{ success: boolean, results: { total: number, success: number, failed: number, errors: string[] } }>('/api/youth/bulk-upload', {
        method: 'POST',
        body: formData,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['youth'] })
    },
  })
}
