import { useQuery } from '@tanstack/vue-query'
import type { DashboardStats } from '~~/shared/types'

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => $fetch<DashboardStats>('/api/dashboard/stats'),
  })
}
