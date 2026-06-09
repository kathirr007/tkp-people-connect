import Aura from '@primeuix/themes/aura'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  modules: [
    '@primevue/nuxt-module',
    '@vueuse/nuxt',
    'nuxt-security',
  ],

  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET || '',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || '',
    dbDriver: process.env.DB_DRIVER || 'sqlite',
    awsRegion: process.env.AWS_REGION || 'us-east-1',
    awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    emailFrom: process.env.EMAIL_FROM || 'noreply@tkp-people-connect.com',
    public: {
      appName: 'TKP People Connect',
      appUrl: process.env.APP_URL || 'http://localhost:3000',
    },
  },

  primevue: {
    autoImport: true,
    options: {
      ripple: true,
      inputVariant: 'filled',
      theme: {
        preset: Aura,
        options: {
          prefix: 'p',
          darkModeSelector: '.dark-mode',
          cssLayer: false,
        },
      },
    },
  },

  security: {
    headers: {
      crossOriginEmbedderPolicy: 'unsafe-none',
      contentSecurityPolicy: {
        'base-uri': ["'none'"],
        'font-src': ["'self'", 'https:', 'data:'],
        'form-action': ["'self'"],
        'frame-ancestors': ["'self'"],
        'img-src': ["'self'", 'data:', 'https:'],
        'object-src': ["'none'"],
        'script-src-attr': ["'none'"],
        'style-src': ["'self'", "'unsafe-inline'"],
        'upgrade-insecure-requests': true,
      },
    },
    rateLimiter: {
      tokensPerInterval: 150,
      interval: 300000,
    },
  },

  routeRules: {
    '/': { prerender: true },
    '/login': { prerender: true },
    '/register': { prerender: true },
    '/forgot-password': { prerender: true },
    '/reset-password': { prerender: true },
    '/verify-email': { prerender: true },
    '/api/auth/login': {
      security: {
        rateLimiter: { tokensPerInterval: 5, interval: 60000 },
      },
    },
    '/api/auth/register': {
      security: {
        rateLimiter: { tokensPerInterval: 3, interval: 60000 },
      },
    },
    '/api/auth/forgot-password': {
      security: {
        rateLimiter: { tokensPerInterval: 3, interval: 300000 },
      },
    },
  },

  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
  },

  css: ['primeicons/primeicons.css', '~/assets/css/main.css'],

  nitro: {
    plugins: ['~~/server/plugins/database.ts'],
    preset: 'vercel',
    prerender: {
      routes: ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'],
    },
    unenv: {
      external: ['postgres', 'bcryptjs', '@aws-sdk/client-ses', 'jose'],
    },
  },

  typescript: {
    strict: true,
  },

  devtools: { enabled: false },
  vite: {
    optimizeDeps: {
      include: [
        '@tanstack/vue-query',
        'primevue/datatable',
        'primevue/column',
        'primevue/button',
        'primevue/card',
        'primevue/inputtext',
        'primevue/dialog',
        'primevue/menu',
        'primevue/toast',
        'primevue/confirmdialog',
        'primevue/password',
        'primevue/tag',
        'primevue/message',
        'primevue/skeleton',
        'primevue/fileupload',
        'primevue/toggleswitch',
        'primevue/autocomplete',
        'primevue/textarea',
        'primevue/iconfield',
        'primevue/inputicon',
        'primevue/progressbar',
        'primevue/select',
        'primevue/useconfirm',
      ],
    },
  }
})
