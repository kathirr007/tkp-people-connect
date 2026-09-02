<script setup lang="ts">
import type { DuplicateMatch } from '~~/shared/types/ai'

defineProps<{
  duplicates: DuplicateMatch[]
}>()

const emit = defineEmits<{
  close: []
}>()

function getSeverity(severity: 'likely' | 'possible') {
  return severity === 'likely' ? 'danger' : 'warn'
}

function getLabel(severity: 'likely' | 'possible') {
  return severity === 'likely' ? 'Likely Duplicate' : 'Possible Duplicate'
}
</script>

<template>
  <Dialog
    :visible="true" header="Duplicate Detection Results" modal :style="{ width: '36rem' }"
    :closable="true" @close="emit('close')"
  >
    <div class="ai-duplicate-warning">
      <div class="ai-duplicate-summary">
        <i class="pi pi-exclamation-triangle" style="color: var(--p-yellow-500); font-size: 1.5rem;" />
        <div>
          <strong>{{ duplicates.length }} potential {{ duplicates.length === 1 ? 'duplicate' : 'duplicates' }} detected</strong>
          <p style="margin: 0; color: var(--p-text-muted-color); font-size: 0.8rem;">
            These records may already exist in the database based on AI similarity analysis.
          </p>
        </div>
      </div>

      <div class="ai-duplicate-list">
        <div v-for="(dup, i) in duplicates" :key="i" class="ai-duplicate-item">
          <div class="ai-duplicate-item-header">
            <span class="ai-duplicate-row">Row {{ dup.row }}</span>
            <Tag :value="getLabel(dup.severity)" :severity="getSeverity(dup.severity)" size="small" />
          </div>
          <div class="ai-duplicate-item-match">
            Matched with: <strong>{{ dup.matchedName }}</strong>
            ({{ dup.matchedType }})
          </div>
          <div class="ai-duplicate-item-score">
            <div class="ai-duplicate-score-bar">
              <div
                class="ai-duplicate-score-fill"
                :style="{ width: `${Math.round(dup.score * 100)}%`, background: dup.severity === 'likely' ? 'var(--p-red-500)' : 'var(--p-yellow-500)' }"
              />
            </div>
            <span class="ai-duplicate-score-label">{{ Math.round(dup.score * 100) }}% similar</span>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <Button label="Continue Anyway" severity="secondary" text @click="emit('close')" />
    </template>
  </Dialog>
</template>

<style scoped>
.ai-duplicate-warning {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ai-duplicate-summary {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--p-yellow-50);
  border: 1px solid var(--p-yellow-200);
  border-radius: 0.5rem;
}

.ai-duplicate-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 300px;
  overflow-y: auto;
}

.ai-duplicate-item {
  padding: 0.75rem;
  border: 1px solid var(--p-border-color);
  border-radius: 0.5rem;
}

.ai-duplicate-item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}

.ai-duplicate-row {
  font-weight: 600;
  font-size: 0.875rem;
}

.ai-duplicate-item-match {
  font-size: 0.8rem;
  color: var(--p-text-muted-color);
  margin-bottom: 0.5rem;
}

.ai-duplicate-item-score {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.ai-duplicate-score-bar {
  flex: 1;
  height: 4px;
  background: var(--p-surface-200);
  border-radius: 2px;
  overflow: hidden;
}

.ai-duplicate-score-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s;
}

.ai-duplicate-score-label {
  font-size: 0.7rem;
  color: var(--p-text-muted-color);
  white-space: nowrap;
}
</style>
