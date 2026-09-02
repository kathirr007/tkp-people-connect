<script setup lang="ts">
const { messages, isQuerying, error, currentStatus, sendQuery, clearMessages } = useAiQuery()

const input = ref('')
const chatContainer = ref<HTMLElement | null>(null)

const exampleQueries = [
  'How many people are from Trichy?',
  'List all youth who are currently studying',
  'What is the population of India?',
  'Show me people who are married',
  'How many active users are there?',
]

function renderMarkdown(text: string): string {
  let html = text
    // Escape HTML
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Bold: **text**
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')

  // Convert lines to process lists
  const lines = html.split('\n')
  const processed: string[] = []
  let inList = false

  for (const line of lines) {
    const trimmed = line.trimStart()

    // Unordered list: * item or - item
    const ulMatch = trimmed.match(/^[*\-]\s+(.+)/)
    if (ulMatch) {
      if (!inList) {
        processed.push('<ul>')
        inList = true
      }
      processed.push(`<li>${ulMatch[1]}</li>`)
      continue
    }

    // Ordered list: 1. item
    const olMatch = trimmed.match(/^\d+\.\s+(.+)/)
    if (olMatch) {
      if (!inList) {
        processed.push('<ul>')
        inList = true
      }
      processed.push(`<li>${olMatch[1]}</li>`)
      continue
    }

    // Close list if we're no longer in list items
    if (inList) {
      processed.push('</ul>')
      inList = false
    }

    processed.push(line)
  }
  if (inList)
    processed.push('</ul>')

  // Double newlines → paragraph break
  return processed.join('\n').replace(/\n{2,}/g, '<br><br>')
}

async function handleSubmit() {
  if (!input.value.trim() || isQuerying.value)
    return
  const query = input.value
  input.value = ''
  await sendQuery(query)
  scrollToBottom()
}

function handleExample(query: string) {
  input.value = query
  handleSubmit()
}

function scrollToBottom() {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

// Auto-scroll when streaming content updates
watch(() => messages.value.map(m => m.content).join(''), () => {
  scrollToBottom()
})
</script>

<template>
  <div class="ai-query-panel">
    <div class="ai-query-header">
      <h3>
        <i class="pi pi-comments" />
        AI Data Assistant
      </h3>
      <Button
        v-if="messages.length" icon="pi pi-trash" text rounded size="small"
        aria-label="Clear chat" @click="clearMessages"
      />
    </div>

    <div ref="chatContainer" class="ai-query-messages">
      <div v-if="messages.length === 0" class="ai-query-empty">
        <i class="pi pi-sparkles" style="font-size: 2rem; color: var(--p-primary-color);" />
        <p>Ask questions about your data or anything — AI decides the best source</p>
        <div class="ai-query-examples">
          <Button
            v-for="example in exampleQueries" :key="example" :label="example" size="small"
            outlined severity="secondary" class="ai-query-example" @click="handleExample(example)"
          />
        </div>
      </div>

      <div
        v-for="msg in messages" :key="msg.id" class="ai-query-message"
        :class="`ai-query-message--${msg.role}`"
      >
        <div class="ai-query-message-avatar">
          <i :class="msg.role === 'user' ? 'pi pi-user' : 'pi pi-sparkles'" />
        </div>
        <div class="ai-query-message-content">
          <div class="ai-query-message-text">
            <span v-html="renderMarkdown(msg.content)" /><span v-if="msg.isStreaming" class="ai-query-cursor" />
          </div>
          <div v-if="msg.source" class="ai-query-source-badge">
            <i :class="msg.source === 'web' ? 'pi pi-globe' : msg.source === 'both' ? 'pi pi-objects' : 'pi pi-database'" />
            <span>{{ msg.source === 'web' ? 'Web Search' : msg.source === 'both' ? 'Database + Web' : 'Database' }}</span>
          </div>
          <div v-if="msg.webResults && msg.webResults.length" class="ai-query-web-results">
            <div class="ai-query-web-header">
              <i class="pi pi-external-link" />
              <span>Web Sources</span>
            </div>
            <div v-for="(r, i) in msg.webResults" :key="i" class="ai-query-web-item">
              <a :href="r.url" target="_blank" rel="noopener">{{ r.title }}</a>
              <span class="ai-query-web-snippet">{{ r.snippet }}</span>
            </div>
          </div>
          <div v-if="msg.sql" class="ai-query-sql">
            <div class="ai-query-sql-header">
              <i class="pi pi-code" />
              <span>Generated SQL ({{ msg.rowCount }} rows)</span>
            </div>
            <code>{{ msg.sql }}</code>
          </div>
          <div class="ai-query-message-time">
            {{ msg.timestamp.toLocaleTimeString() }}
          </div>
        </div>
      </div>

      <div v-if="isQuerying && currentStatus" class="ai-query-message ai-query-message--assistant">
        <div class="ai-query-message-avatar">
          <i class="pi pi-sparkles" />
        </div>
        <div class="ai-query-message-content">
          <div class="ai-query-status">
            <div class="ai-query-status-spinner" />
            <span>{{ currentStatus }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="error" class="ai-query-error">
      <Message severity="error" :closable="false">
        {{ error }}
      </Message>
    </div>

    <form class="ai-query-input" @submit.prevent="handleSubmit">
      <InputText v-model="input" placeholder="Ask about your data or anything else..." :disabled="isQuerying" fluid />
      <Button
        type="submit" icon="pi pi-send" :disabled="!input.trim() || isQuerying"
        :loading="isQuerying"
      />
    </form>
  </div>
</template>

<style scoped>
.ai-query-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 400px;
}

.ai-query-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--p-border-color);
}

.ai-query-header h3 {
  margin: 0;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.ai-query-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ai-query-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  color: var(--p-text-muted-color);
  gap: 1rem;
}

.ai-query-examples {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  max-width: 500px;
}

.ai-query-example {
  font-size: 0.75rem !important;
}

.ai-query-message {
  display: flex;
  gap: 0.75rem;
}

.ai-query-message--user {
  flex-direction: row-reverse;
}

.ai-query-message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 0.875rem;
}

.ai-query-message--user .ai-query-message-avatar {
  background: var(--p-primary-color);
  color: white;
}

.ai-query-message--assistant .ai-query-message-avatar {
  background: var(--p-surface-200);
  color: var(--p-primary-color);
}

.dark-mode .ai-query-message--assistant .ai-query-message-avatar {
  background: var(--p-surface-600);
}

.ai-query-message-content {
  max-width: 80%;
  min-width: 0;
}

.ai-query-message-text {
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  line-height: 1.5;
  word-break: break-word;
}

.ai-query-message-text :deep(ul) {
  margin: 0.25rem 0;
  padding-left: 1.25rem;
  list-style: disc;
}

.ai-query-message-text :deep(li) {
  margin: 0.15rem 0;
}

.ai-query-message-text :deep(strong) {
  font-weight: 600;
}

.ai-query-message--user .ai-query-message-text {
  background: var(--p-primary-color);
  color: white;
}

.ai-query-message--assistant .ai-query-message-text {
  background: var(--p-surface-100);
  border: 1px solid var(--p-border-color);
}

.dark-mode .ai-query-message--assistant .ai-query-message-text {
  background: var(--p-surface-700);
}

.ai-query-cursor {
  display: inline-block;
  width: 2px;
  height: 1em;
  background: var(--p-primary-color);
  margin-left: 2px;
  animation: blink 0.8s infinite;
  vertical-align: text-bottom;
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

.ai-query-sql {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: var(--p-surface-50);
  border: 1px solid var(--p-border-color);
  border-radius: 0.5rem;
}

.dark-mode .ai-query-sql {
  background: var(--p-surface-800);
}

.ai-query-sql-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.7rem;
  color: var(--p-text-muted-color);
  margin-bottom: 0.25rem;
}

.ai-query-sql code {
  display: block;
  font-size: 0.75rem;
  white-space: pre-wrap;
  word-break: break-all;
}

.ai-query-source-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: 0.5rem;
  padding: 0.2rem 0.6rem;
  font-size: 0.7rem;
  border-radius: 1rem;
  background: var(--p-surface-100);
  border: 1px solid var(--p-border-color);
  color: var(--p-text-muted-color);
}

.dark-mode .ai-query-source-badge {
  background: var(--p-surface-700);
}

.ai-query-web-results {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: var(--p-surface-50);
  border: 1px solid var(--p-border-color);
  border-radius: 0.5rem;
}

.dark-mode .ai-query-web-results {
  background: var(--p-surface-800);
}

.ai-query-web-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.7rem;
  color: var(--p-text-muted-color);
  margin-bottom: 0.35rem;
}

.ai-query-web-item {
  font-size: 0.75rem;
  padding: 0.25rem 0;
  border-bottom: 1px solid var(--p-surface-200);
}

.dark-mode .ai-query-web-item {
  border-bottom-color: var(--p-surface-600);
}

.ai-query-web-item:last-child {
  border-bottom: none;
}

.ai-query-web-item a {
  color: var(--p-primary-color);
  text-decoration: none;
  font-weight: 500;
}

.ai-query-web-item a:hover {
  text-decoration: underline;
}

.ai-query-web-snippet {
  display: block;
  font-size: 0.7rem;
  color: var(--p-text-muted-color);
  margin-top: 0.1rem;
  line-height: 1.3;
}

.ai-query-message-time {
  font-size: 0.65rem;
  color: var(--p-text-muted-color);
  margin-top: 0.25rem;
}

.ai-query-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: var(--p-surface-100);
  border: 1px solid var(--p-border-color);
  border-radius: 1rem;
  font-size: 0.8rem;
  color: var(--p-text-muted-color);
}

.dark-mode .ai-query-status {
  background: var(--p-surface-700);
}

.ai-query-status-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid var(--p-surface-300);
  border-top-color: var(--p-primary-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.dark-mode .ai-query-status-spinner {
  border-color: var(--p-surface-600);
  border-top-color: var(--p-primary-color);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.ai-query-input {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--p-border-color);
}
</style>
