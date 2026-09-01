import type { AiProviderClient, AiProviderConfig } from './providers/base'
import process from 'node:process'
import { GeminiProvider } from './providers/gemini'
import { GroqProvider } from './providers/groq'
import { OllamaProvider } from './providers/ollama'

let _client: AiProviderClient | null = null

function getConfig(): AiProviderConfig {
  return {
    ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    ollamaEmbedModel: process.env.OLLAMA_EMBED_MODEL || 'nomic-embed-text',
    ollamaChatModel: process.env.OLLAMA_CHAT_MODEL || 'llama3.1',
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    geminiChatModel: process.env.GEMINI_CHAT_MODEL || 'gemini-3.6-flash',
    groqApiKey: process.env.GROQ_API_KEY || '',
  }
}

async function detectProvider(config: AiProviderConfig): Promise<AiProviderClient> {
  const ollama = new OllamaProvider(config.ollamaBaseUrl, config.ollamaEmbedModel, config.ollamaChatModel)
  if (await ollama.isAvailable()) {
    console.warn('[AI] Using Ollama provider (local)')
    return ollama
  }

  if (config.geminiApiKey) {
    const gemini = new GeminiProvider(config.geminiApiKey)
    if (await gemini.isAvailable()) {
      console.warn('[AI] Using Gemini provider (free tier)')
      return gemini
    }
  }

  if (config.groqApiKey) {
    const groq = new GroqProvider(config.groqApiKey)
    if (await groq.isAvailable()) {
      console.warn('[AI] Using Groq provider (free tier, chat only)')
      return groq
    }
  }

  throw new Error(
    '[AI] No AI provider available. Install Ollama (https://ollama.com) or set GEMINI_API_KEY / GROQ_API_KEY in .env',
  )
}

function createFromEnv(config: AiProviderConfig, provider: string): AiProviderClient {
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
      return new GroqProvider(config.groqApiKey)
    default:
      throw new Error(`Unknown AI provider: ${provider}`)
  }
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
    _client = createFromEnv(config, providerName)
  }

  return _client
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
  const client = await getAiClient()
  if (!client.embeddingModel) {
    const config = getConfig()
    const ollama = new OllamaProvider(config.ollamaBaseUrl, config.ollamaEmbedModel, config.ollamaChatModel)
    if (await ollama.isAvailable()) {
      return ollama
    }
    throw new Error('No embedding provider available. Install Ollama for embeddings.')
  }
  return client
}
