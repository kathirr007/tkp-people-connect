import type { AiProviderInfo } from '~~/shared/types/ai'
import { getAiClientSafe } from '../../utils/ai/client'

export default defineEventHandler(async () => {
  const client = await getAiClientSafe()

  if (!client) {
    return {
      name: 'none' as const,
      available: false,
      embeddingModel: null,
      chatModel: '',
      embeddingDimensions: 0,
    } satisfies AiProviderInfo
  }

  return {
    name: client.name as AiProviderInfo['name'],
    available: true,
    embeddingModel: client.embeddingModel,
    chatModel: client.chatModel,
    embeddingDimensions: client.embeddingDimensions,
  } satisfies AiProviderInfo
})
