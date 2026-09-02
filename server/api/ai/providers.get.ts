import process from 'node:process'

export default defineEventHandler((event) => {
  requireAuth(event)

  const providers: { name: string, label: string }[] = [
    { name: 'auto', label: 'Auto' },
  ]

  if (process.env.GEMINI_API_KEY)
    providers.push({ name: 'gemini', label: 'Gemini' })

  if (process.env.GROQ_API_KEY)
    providers.push({ name: 'groq', label: 'Groq' })

  providers.push({ name: 'ollama', label: 'Ollama' })

  return { providers }
})
