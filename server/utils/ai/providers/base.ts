export interface AiProviderClient {
  readonly name: string
  readonly chatModel: string
  readonly embeddingModel: string | null
  readonly embeddingDimensions: number

  isAvailable: () => Promise<boolean>
  generateEmbedding: (text: string) => Promise<number[]>
  generateEmbeddings: (texts: string[]) => Promise<number[][]>
  chatCompletion: (prompt: string, systemPrompt?: string) => Promise<string>
}

export interface AiProviderConfig {
  ollamaBaseUrl: string
  ollamaEmbedModel: string
  ollamaChatModel: string
  geminiApiKey: string
  geminiChatModel: string
  groqApiKey: string
}
