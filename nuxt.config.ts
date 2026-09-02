import process from 'node:process'
import Aura from '@primeuix/themes/aura'

export default defineNuxtConfig({
  compatibilityDate: '2026-09-01',

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
    aiProvider: process.env.AI_PROVIDER || 'auto',
    ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    ollamaEmbedModel: process.env.OLLAMA_EMBED_MODEL || 'nomic-embed-text',
    ollamaChatModel: process.env.OLLAMA_CHAT_MODEL || 'llama3.1',
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    geminiChatModel: process.env.GEMINI_CHAT_MODEL || 'gemini-3.6-flash',
    groqApiKey: process.env.GROQ_API_KEY || '',
    groqChatModel: process.env.GROQ_CHAT_MODEL || 'llama-3.3-70b-versatile',
    aiEmbedProvider: process.env.AI_EMBED_PROVIDER || '',
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
        'base-uri': ['\'none\''],
        'font-src': ['\'self\'', 'https:', 'data:'],
        'form-action': ['\'self\''],
        'frame-ancestors': ['\'self\''],
        'img-src': ['\'self\'', 'data:', 'https:'],
        'object-src': ['\'none\''],
        'script-src-attr': ['\'none\''],
        'style-src': ['\'self\'', '\'unsafe-inline\''],
        'upgrade-insecure-requests': true,
      },
    },
    rateLimiter: {
      tokensPerInterval: 150,
      interval: 300000,
    },
  },

  routeRules: {
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
    '/api/auth/resend-verification': {
      security: {
        rateLimiter: { tokensPerInterval: 3, interval: 300000 },
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
    externals: {
      inline: [],
    },
    rollupConfig: {
      external: [],
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
        'primevue/selectbutton',
        'primevue/skeleton',
        'primevue/tag',
        'primevue/textarea',
        'primevue/toast',
        'primevue/toggleswitch',
        'primevue/useconfirm',
        'zod',
        'ollama',
        '@google/generative-ai',
        'groq-sdk',
      ],
    },
  },
})
