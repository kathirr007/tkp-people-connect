import { join } from 'node:path'
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  compatibilityDate: '2026-09-01',
  ssr: true,

  modules: [
    '@primevue/nuxt-module',
    '@vueuse/nuxt',
    '@nuxt/icon', // Add the new icon module
  ],

  css: [
    '~/assets/css/main.css',
    'primeicons/primeicons.css',
  ],

  primevue: {
    options: {
      theme: {
        preset: 'lara-light-indigo', // Use a standard preset
        options: {
          darkModeSelector: '.dark-mode',
          cssLayer: {
            name: 'theme',
            order: 'tailwind-base tailwind-utilities theme',
          },
        },
      },
    },
    components: {
      include: [
        'AutoComplete',
        'Button',
        'Card',
        'Column',
        'ConfirmDialog',
        'DataTable',
        'Dialog',
        'FileUpload',
        'IconField',
        'InputIcon',
        'InputText',
        'Menu',
        'Message',
        'Password',
        'ProgressBar',
        'Select',
        'Skeleton',
        'Tag',
        'Textarea',
        'Toast',
        'ToggleSwitch',
        'TriStateCheckbox',
      ],
    },
  },

  // Iconify configuration

  nitro: {
    experimental: {
      wasm: true,
    },
  },

  experimental: {
    viewTransition: true,
  },

  alias: {
    '~~': __dirname,
    '~shared': join(__dirname, 'shared'),
    '~~/shared': join(__dirname, 'shared'),
  },

  build: {
    transpile: [
      '@tanstack/vue-query',
      'primevue/autocomplete',
      'primevue/button',
      'primevue/card',
      'primevue/column',
      'primevue/confirmdialog',
      'primevue/datatable',
      'primevue/dialog',
      'primevue/fileupload',
      'primevue/iconfield',
      'primevue/inputicon',
      'primevue/inputtext',
      'primevue/menu',
      'primevue/message',
      'primevue/password',
      'primevue/progressbar',
      'primevue/select',
      'primevue/skeleton',
      'primevue/tag',
      'primevue/textarea',
      'primevue/toast',
      'primevue/toggleswitch',
      'primevue/tristatecheckbox',
      'zod',
    ],
  },
})
