import type { DashboardStats } from '~~/shared/types'
import { useQuery } from '@tanstack/vue-query'

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => $fetch<DashboardStats>('/api/dashboard/stats'),
  })
}
