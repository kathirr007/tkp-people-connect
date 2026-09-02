import type { AiProviderClient, AiProviderConfig } from './providers/base'
import process from 'node:process'
import { GeminiProvider } from './providers/gemini'
import { GroqProvider } from './providers/groq'
import { OllamaProvider } from './providers/ollama'

let _client: AiProviderClient | null = null
let _embedClient: AiProviderClient | null = null

function getConfig(): AiProviderConfig {
  return {
    ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    ollamaEmbedModel: process.env.OLLAMA_EMBED_MODEL || 'nomic-embed-text',
    ollamaChatModel: process.env.OLLAMA_CHAT_MODEL || 'llama3.1',
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    geminiChatModel: process.env.GEMINI_CHAT_MODEL || 'gemini-3.6-flash',
    groqApiKey: process.env.GROQ_API_KEY || '',
    groqChatModel: process.env.GROQ_CHAT_MODEL || 'llama-3.3-70b-versatile',
    aiEmbedProvider: process.env.AI_EMBED_PROVIDER || '',
  }
}

function createChatProvider(config: AiProviderConfig, provider: string): AiProviderClient {
  switch (provider) {
    case 'ollama':
      return new OllamaProvider(config.ollamaBaseUrl, config.ollamaEmbedModel, config.ollamaChatModel)
    case 'gemini':
      if (!config.geminiApiKey)
        throw new Error('GEMINI_API_KEY is required for Gemini provider')
      return new GeminiProvider(config.geminiApiKey, config.geminiChatModel)
    case 'groq':
      if (!config.groqApiKey)
        throw new Error('GROQ_API_KEY is required for Groq provider')
      return new GroqProvider(config.groqApiKey, config.groqChatModel)
    default:
      throw new Error(`Unknown AI provider: ${provider}`)
  }
}

function createEmbedProvider(config: AiProviderConfig, provider: string): AiProviderClient {
  switch (provider) {
    case 'gemini':
      if (!config.geminiApiKey)
        throw new Error('GEMINI_API_KEY is required for Gemini embeddings')
      return new GeminiProvider(config.geminiApiKey, config.geminiChatModel)
    case 'ollama':
      return new OllamaProvider(config.ollamaBaseUrl, config.ollamaEmbedModel, config.ollamaChatModel)
    case 'groq':
      throw new Error('Groq does not support embeddings. Use GEMINI_API_KEY or Ollama.')
    default:
      throw new Error(`Unknown embedding provider: ${provider}`)
  }
}

async function detectProvider(config: AiProviderConfig): Promise<AiProviderClient> {
  const ollama = new OllamaProvider(config.ollamaBaseUrl, config.ollamaEmbedModel, config.ollamaChatModel)
  if (await ollama.isAvailable()) {
    console.warn('[AI] Using Ollama provider (local)')
    return ollama
  }

  if (config.groqApiKey) {
    const groq = new GroqProvider(config.groqApiKey, config.groqChatModel)
    if (await groq.isAvailable()) {
      console.warn('[AI] Using Groq provider (free tier, ~1000 req/day)')
      return groq
    }
  }

  if (config.geminiApiKey) {
    const gemini = new GeminiProvider(config.geminiApiKey, config.geminiChatModel)
    if (await gemini.isAvailable()) {
      console.warn('[AI] Using Gemini provider (free tier)')
      return gemini
    }
  }

  throw new Error(
    '[AI] No AI provider available. Install Ollama or set GROQ_API_KEY / GEMINI_API_KEY in .env',
  )
}

export async function getAiClient(): Promise<AiProviderClient> {
  if (_client)
    return _client

  const config = getConfig()
  const providerName = process.env.AI_PROVIDER || 'auto'

  if (providerName === 'auto') {
    _client = await detectProvider(config)
  }
  else {
    _client = createChatProvider(config, providerName)
  }

  const embedInfo = _client.embeddingModel ? '(chat + embed)' : '(chat only)'
  console.warn(`[AI] Chat provider: ${_client.name} ${embedInfo} — model: ${_client.chatModel}`)

  return _client
}

export async function getAiClientByName(providerName: string): Promise<AiProviderClient> {
  if (!providerName || providerName === 'auto') {
    return getAiClient()
  }
  const config = getConfig()
  return createChatProvider(config, providerName)
}

export async function getAiClientSafe(): Promise<AiProviderClient | null> {
  try {
    return await getAiClient()
  }
  catch {
    return null
  }
}

export async function getEmbeddingClient(): Promise<AiProviderClient> {
  if (_embedClient)
    return _embedClient

  const config = getConfig()
  const embedProviderName = config.aiEmbedProvider

  // 1. If AI_EMBED_PROVIDER is explicitly set, use that provider
  if (embedProviderName) {
    _embedClient = createEmbedProvider(config, embedProviderName)
    console.warn(`[AI] Embedding provider: ${_embedClient.name} (explicit) — model: ${_embedClient.embeddingModel}`)
    return _embedClient
  }

  // 2. If chat provider supports embeddings, use it
  const chatClient = await getAiClient()
  if (chatClient.embeddingModel) {
    _embedClient = chatClient
    console.warn(`[AI] Embedding provider: ${_embedClient.name} (same as chat) — model: ${_embedClient.embeddingModel}`)
    return _embedClient
  }

  // 3. Chat provider has no embeddings — try Gemini
  if (config.geminiApiKey) {
    const gemini = new GeminiProvider(config.geminiApiKey, config.geminiChatModel)
    _embedClient = gemini
    console.warn(`[AI] Embedding provider: gemini (fallback) — model: ${gemini.embeddingModel}`)
    return _embedClient
  }

  // 4. Try Ollama
  const ollama = new OllamaProvider(config.ollamaBaseUrl, config.ollamaEmbedModel, config.ollamaChatModel)
  if (await ollama.isAvailable()) {
    _embedClient = ollama
    console.warn(`[AI] Embedding provider: ollama (fallback) — model: ${ollama.embeddingModel}`)
    return _embedClient
  }

  throw new Error(
    'No embedding provider available. Set AI_EMBED_PROVIDER=gemini or install Ollama.',
  )
}
