import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { PaginatedResponse, Person, PersonFormData } from '~~/shared/types'

export interface PeopleFilters {
  page?: number
  limit?: number
  search?: string
  organization?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  isActive?: string
}

export function usePeopleList(filters: Ref<PeopleFilters>) {
  return useQuery({
    queryKey: ['people', filters],
    queryFn: () =>
      $fetch<PaginatedResponse<Person>>('/api/people', {
        query: filters.value,
      }),
  })
}

export function usePerson(id: Ref<string>) {
  return useQuery({
    queryKey: ['person', id],
    queryFn: () => $fetch<{ data: Person }>(`/api/people/${id.value}`),
    enabled: computed(() => !!id.value),
  })
}

export function useCreatePerson() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: PersonFormData) =>
      $fetch('/api/people', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}

export function useUpdatePerson() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: PersonFormData }) =>
      $fetch(`/api/people/${id}`, { method: 'PUT', body: data }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['people'] })
      queryClient.invalidateQueries({ queryKey: ['person', variables.id] })
    },
  })
}

export function useDeletePerson() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      $fetch(`/api/people/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}

export function useBulkUpload() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (formData: FormData) =>
      $fetch<{ success: boolean, results: { total: number, success: number, failed: number, errors: string[] } }>('/api/people/bulk-upload', {
        method: 'POST',
        body: formData,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}
