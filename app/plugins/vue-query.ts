import { VueQueryPlugin, QueryClient, hydrate, dehydrate } from '@tanstack/vue-query'
import type { DehydratedState } from '@tanstack/vue-query'

export default defineNuxtPlugin((nuxtApp) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  })

  nuxtApp.vueApp.use(VueQueryPlugin, { queryClient })

  const state = useState<DehydratedState | null>('vue-query')

  if (import.meta.server) {
    nuxtApp.hooks.hook('app:rendered', () => {
      state.value = dehydrate(queryClient)
    })
  }

  if (import.meta.client) {
    nuxtApp.hooks.hook('app:created', () => {
      hydrate(queryClient, state.value)
    })
  }
})
