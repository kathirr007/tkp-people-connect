export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface ApiSuccessResponse<T = unknown> {
  success: true
  data?: T
  message?: string
}

export interface ApiErrorResponse {
  statusCode: number
  statusMessage: string
  message: string
  data?: {
    errors?: Record<string, string[]>
  }
}

export interface BulkUploadResults {
  success: boolean
  results: {
    total: number
    success: number
    failed: number
    errors: string[]
  }
}

export interface DashboardStats {
  totalPeople: number
  activePeople: number
  inactivePeople: number
  totalOrganizations: number
  recentlyAdded: Array<{
    _id: string
    firstName: string
    lastName: string
    organization?: string
    createdAt: string
  }>
  byOrganization: Array<{
    name: string
    count: number
  }>
}
