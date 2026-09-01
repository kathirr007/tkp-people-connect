import type { AiProviderClient } from './base'
import { Ollama } from 'ollama'

export class OllamaProvider implements AiProviderClient {
  readonly name = 'ollama' as const
  readonly embeddingModel: string
  readonly chatModel: string
  readonly embeddingDimensions = 1536

  private client: Ollama

  constructor(baseUrl: string, embedModel: string, chatModel: string) {
    this.embeddingModel = embedModel
    this.chatModel = chatModel
    this.client = new Ollama({ host: baseUrl })
  }

  async isAvailable(): Promise<boolean> {
    try {
      await this.client.list()
      return true
    }
    catch {
      return false
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.client.embeddings({
      model: this.embeddingModel,
      input: text,
    })
    return response.embedding
  }

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    const results: number[][] = []
    for (const text of texts) {
      results.push(await this.generateEmbedding(text))
    }
    return results
  }

  async chatCompletion(prompt: string, systemPrompt?: string): Promise<string> {
    const messages: Array<{ role: 'system' | 'user', content: string }> = []
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt })
    }
    messages.push({ role: 'user', content: prompt })

    const response = await this.client.chat({
      model: this.chatModel,
      messages,
    })
    return response.message.content
  }
}
