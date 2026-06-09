<script setup lang="ts">
import Button from 'primevue/button'
import { useDark, useToggle } from '@vueuse/core'

const isDark = useDark({
  selector: 'html',
  attribute: 'class',
  valueDark: 'dark-mode',
  valueLight: '',
})
const toggleDark = useToggle(isDark)
</script>

<template>
  <Button
    :icon="isDark ? 'pi pi-sun' : 'pi pi-moon'"
    text
    rounded
    severity="secondary"
    @click="toggleDark()"
  />
</template>
