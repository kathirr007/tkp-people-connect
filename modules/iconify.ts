import { addComponent, defineNuxtModule } from '@nuxt/kit'

export default defineNuxtModule({
  meta: {
    name: 'iconify',
    configKey: 'iconify',
  },
  setup(_options, _nuxt) {
    // Register the Icon component globally
    addComponent({
      name: 'Icon',
      export: 'Icon',
      filePath: '@iconify/vue',
    })
  },
})
