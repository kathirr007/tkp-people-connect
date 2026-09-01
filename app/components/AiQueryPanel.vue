<script setup lang="ts">
const { messages, isQuerying, error, sendQuery, clearMessages } = useAiQuery()

const input = ref('')
const chatContainer = ref<HTMLElement | null>(null)

const exampleQueries = [
  'How many people are from Trichy?',
  'List all youth who are currently studying',
  'Show me people who are married',
  'What are the most common interests among youth?',
  'How many active users are there?',
]

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
        <p>Ask questions about your data in natural language</p>
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
            {{ msg.content }}
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

      <div v-if="isQuerying" class="ai-query-message ai-query-message--assistant">
        <div class="ai-query-message-avatar">
          <i class="pi pi-sparkles" />
        </div>
        <div class="ai-query-message-content">
          <div class="ai-query-typing">
            <span /><span /><span />
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
      <InputText v-model="input" placeholder="Ask about your data..." :disabled="isQuerying" fluid />
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

.ai-query-message-content {
  max-width: 80%;
  min-width: 0;
}

.ai-query-message-text {
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

.ai-query-message--user .ai-query-message-text {
  background: var(--p-primary-color);
  color: white;
}

.ai-query-message--assistant .ai-query-message-text {
  background: var(--p-surface-100);
  border: 1px solid var(--p-border-color);
}

.ai-query-sql {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: var(--p-surface-50);
  border: 1px solid var(--p-border-color);
  border-radius: 0.5rem;
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

.ai-query-message-time {
  font-size: 0.65rem;
  color: var(--p-text-muted-color);
  margin-top: 0.25rem;
}

.ai-query-typing {
  display: flex;
  gap: 0.25rem;
  padding: 0.75rem 1rem;
  background: var(--p-surface-100);
  border: 1px solid var(--p-border-color);
  border-radius: 1rem;
}

.ai-query-typing span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--p-text-muted-color);
  animation: typing 1.4s infinite ease-in-out;
}

.ai-query-typing span:nth-child(2) {
  animation-delay: 0.2s;
}
.ai-query-typing span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%,
  80%,
  100% {
    transform: scale(0.6);
    opacity: 0.4;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.ai-query-input {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--p-border-color);
}
</style>
