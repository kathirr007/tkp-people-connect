import type { AiProviderClient } from './base'
import Groq from 'groq-sdk'

export class GroqProvider implements AiProviderClient {
  readonly name = 'groq' as const
  readonly embeddingModel = null
  readonly chatModel: string
  readonly embeddingDimensions = 0

  private client: Groq

  constructor(apiKey: string, chatModel = 'llama-3.1-8b-instant') {
    this.chatModel = chatModel
    this.client = new Groq({ apiKey })
  }

  async isAvailable(): Promise<boolean> {
    try {
      await this.client.models.list()
      return true
    }
    catch {
      return false
    }
  }

  async generateEmbedding(_text: string): Promise<number[]> {
    throw new Error('Groq does not support embeddings. Use Ollama or Gemini for embeddings.')
  }

  async generateEmbeddings(_texts: string[]): Promise<number[][]> {
    throw new Error('Groq does not support embeddings. Use Ollama or Gemini for embeddings.')
  }

  async chatCompletion(prompt: string, systemPrompt?: string): Promise<string> {
    const messages: Array<{ role: 'system' | 'user', content: string }> = []
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt })
    }
    messages.push({ role: 'user', content: prompt })

    const response = await this.client.chat.completions.create({
      model: this.chatModel,
      messages,
    })
    return response.choices[0]?.message?.content || ''
  }
}
