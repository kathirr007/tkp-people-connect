<script setup lang="ts">
const emit = defineEmits<{ select: [id: string, type: 'people' | 'youth'] }>()

const { results, isSearching, error, provider, isSyncing, fetchProvider, search, syncEmbeddings } = useAiSearch()
const { showSuccess, showError } = useToastMessages()

const query = ref('')
const searchType = ref<'people' | 'youth' | 'all'>('all')
let searchTimeout: ReturnType<typeof setTimeout>

onMounted(() => {
  fetchProvider()
})

function onInput() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    if (query.value.trim().length >= 2) {
      search(query.value, searchType.value)
    }
  }, 500)
}

async function handleSync() {
  try {
    const result = await syncEmbeddings()
    showSuccess('Sync Complete', result.message)
  }
  catch (e: unknown) {
    showError('Sync Failed', e instanceof Error ? e.message : 'Unknown error')
  }
}

function getRecordName(item: { data?: Record<string, unknown> }) {
  if (!item.data)
    return 'Unknown'
  return `${item.data.firstName || ''} ${item.data.lastName || ''}`.trim() || 'Unknown'
}

function getRecordDetail(item: { data?: Record<string, unknown> }) {
  if (!item.data)
    return ''
  const parts: string[] = []
  if (item.data.village)
    parts.push(String(item.data.village))
  if (item.data.age)
    parts.push(`Age ${item.data.age}`)
  return parts.join(' · ')
}
</script>

<template>
  <div class="ai-search-panel">
    <div class="ai-search-header">
      <h3>
        <i class="pi pi-search" />
        AI Semantic Search
      </h3>
      <Tag
        v-if="provider" :value="provider.available ? provider.name : 'unavailable'"
        :severity="provider.available ? 'success' : 'warn'"
      />
    </div>

    <div class="ai-search-input">
      <IconField>
        <InputIcon class="pi pi-sparkles" />
        <InputText
          v-model="query" placeholder="Search by name, village, interests..." fluid
          @input="onInput"
        />
      </IconField>
      <div class="ai-search-controls">
        <SelectButton
          v-model="searchType"
          :options="[{ label: 'All', value: 'all' }, { label: 'People', value: 'people' }, { label: 'Youth', value: 'youth' }]"
          option-label="label" option-value="value" :allow-empty="false"
        />
        <Button
          class="ai-search-sync-btn"
          label="Sync Index" icon="pi pi-refresh" size="small" outlined :loading="isSyncing"
          @click="handleSync"
        />
      </div>
    </div>

    <div v-if="isSearching" class="ai-search-loading">
      <ProgressBar mode="indeterminate" style="height: 4px" />
      <span class="ai-search-hint">Searching semantically...</span>
    </div>

    <div v-else-if="error" class="ai-search-error">
      <Message severity="warn" :closable="false">
        {{ error }}
      </Message>
    </div>

    <div v-else-if="results" class="ai-search-results">
      <div class="ai-search-meta">
        Found {{ results.results.length }} results in {{ results.queryTime }}ms
        ({{ results.totalIndexed }} indexed)
      </div>
      <div v-if="results.results.length === 0" class="ai-search-empty">
        No results found. Try different keywords or sync the index first.
      </div>
      <div v-else class="ai-search-list">
        <div
          v-for="item in results.results" :key="`${item.type}-${item.id}`"
          class="ai-search-item" @click="emit('select', item.id, item.type)"
        >
          <div class="ai-search-item-header">
            <span class="ai-search-item-name">{{ getRecordName(item) }}</span>
            <Tag :value="item.type" severity="info" size="small" />
          </div>
          <div class="ai-search-item-detail">
            {{ getRecordDetail(item) }}
          </div>
          <div class="ai-search-item-score">
            <div class="ai-search-score-bar">
              <div class="ai-search-score-fill" :style="{ width: `${Math.round(item.score * 100)}%` }" />
            </div>
            <span class="ai-search-score-label">{{ Math.round(item.score * 100) }}% match</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ai-search-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ai-search-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ai-search-header h3 {
  margin: 0;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.ai-search-input {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.ai-search-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.ai-search-controls :deep(.p-selectbutton) {
  flex: 1;
  display: flex;
}

.ai-search-controls :deep(.p-selectbutton .p-togglebutton) {
  flex: 1;
  justify-content: center;
}

@media (max-width: 480px) {
  .ai-search-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .ai-search-controls :deep(.p-selectbutton) {
    width: 100%;
  }

  .ai-search-sync-btn {
    align-self: flex-end;
  }
}

.ai-search-loading {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.ai-search-hint {
  font-size: 0.75rem;
  color: var(--p-text-muted-color);
}

.ai-search-meta {
  font-size: 0.75rem;
  color: var(--p-text-muted-color);
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--p-border-color);
}

.ai-search-empty {
  text-align: center;
  padding: 2rem;
  color: var(--p-text-muted-color);
}

.ai-search-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.ai-search-item {
  padding: 0.75rem;
  border: 1px solid var(--p-border-color);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--p-surface-0);
}

.ai-search-item:hover {
  background: var(--p-surface-50);
  border-color: var(--p-primary-color);
}

.dark-mode .ai-search-item {
  background: var(--p-surface-800);
}

.dark-mode .ai-search-item:hover {
  background: var(--p-surface-700);
  border-color: var(--p-primary-color);
}

.ai-search-item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}

.ai-search-item-name {
  font-weight: 600;
}

.ai-search-item-detail {
  font-size: 0.8rem;
  color: var(--p-text-muted-color);
  margin-bottom: 0.5rem;
}

.ai-search-item-score {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.ai-search-score-bar {
  flex: 1;
  height: 4px;
  background: var(--p-surface-200);
  border-radius: 2px;
  overflow: hidden;
}

.dark-mode .ai-search-score-bar {
  background: var(--p-surface-600);
}

.ai-search-score-fill {
  height: 100%;
  background: var(--p-primary-color);
  border-radius: 2px;
  transition: width 0.3s;
}

.ai-search-score-label {
  font-size: 0.7rem;
  color: var(--p-text-muted-color);
  white-space: nowrap;
}
</style>
