import type { AiProviderClient } from './base'
import { GoogleGenerativeAI } from '@google/generative-ai'

export class GeminiProvider implements AiProviderClient {
  readonly name = 'gemini' as const
  readonly embeddingModel: string
  readonly chatModel: string
  readonly embeddingDimensions = 3072

  private genAI: GoogleGenerativeAI
  private readonly apiOpts = { apiVersion: 'v1' }

  constructor(apiKey: string, chatModel = 'gemini-3.6-flash') {
    this.embeddingModel = 'gemini-embedding-001'
    this.chatModel = chatModel
    this.genAI = new GoogleGenerativeAI(apiKey)
  }

  async isAvailable(): Promise<boolean> {
    try {
      const model = this.genAI.getGenerativeModel({ model: this.chatModel }, this.apiOpts)
      await model.countTokens('test')
      return true
    }
    catch {
      return false
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const model = this.genAI.getGenerativeModel({ model: this.embeddingModel }, this.apiOpts)
    const result = await model.embedContent(text)
    return result.embedding.values
  }

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    const model = this.genAI.getGenerativeModel({ model: this.embeddingModel }, this.apiOpts)
    const results: number[][] = []
    const batchResults = await model.batchEmbedContents({
      requests: texts.map(text => ({
        content: { role: 'user', parts: [{ text }] },
        taskType: 'RETRIEVAL_DOCUMENT',
      })),
    })
    for (const result of batchResults.embeddings) {
      results.push(result.values)
    }
    return results
  }

  async chatCompletion(prompt: string, systemPrompt?: string): Promise<string> {
    const model = this.genAI.getGenerativeModel({
      model: this.chatModel,
      systemInstruction: systemPrompt,
    }, this.apiOpts)
    const result = await model.generateContent(prompt)
    return result.response.text()
  }

  async* chatCompletionStream(prompt: string, systemPrompt?: string): AsyncGenerator<string, void, unknown> {
    const model = this.genAI.getGenerativeModel({
      model: this.chatModel,
      systemInstruction: systemPrompt,
    }, this.apiOpts)
    const result = await model.generateContentStream(prompt)
    for await (const chunk of result.stream) {
      const text = chunk.text()
      if (text)
        yield text
    }
  }
}
