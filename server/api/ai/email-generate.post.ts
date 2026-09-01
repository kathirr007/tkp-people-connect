import { findPersonById, findYouthById } from '../../utils/db'
import { sendEmail } from '../../utils/email'
import { generateEmail } from '../../utils/email-generator'

export default defineEventHandler(async (event) => {
  requireAuth(event)

  const body = await readBody(event)
  const { personId, personType, emailType, customContext, subject, to, send } = body as {
    personId?: string
    personType?: 'people' | 'youth'
    emailType?: 'welcome' | 'event' | 'followup' | 'custom'
    customContext?: string
    subject?: string
    to?: string
    send?: boolean
  }

  if (!personId || !personType || !emailType) {
    throw createError({ statusCode: 400, message: 'personId, personType, and emailType are required' })
  }

  // Fetch person data
  let personData: Record<string, unknown> | undefined
  if (personType === 'people') {
    const person = await findPersonById(personId)
    if (person)
      personData = person as unknown as Record<string, unknown>
  }
  else {
    const youth = await findYouthById(personId)
    if (youth)
      personData = youth as unknown as Record<string, unknown>
  }

  if (!personData) {
    throw createError({ statusCode: 404, message: 'Record not found' })
  }

  try {
    const draft = await generateEmail(personData, personType, emailType, customContext, subject)

    // If send is true, actually send the email
    if (send && to) {
      await sendEmail(to, draft.subject, draft.htmlBody)
      return { ...draft, sent: true, to }
    }

    return { ...draft, sent: false }
  }
  catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    if (message.includes('No AI provider available')) {
      throw createError({
        statusCode: 503,
        message: 'AI provider not available. Install Ollama or configure GEMINI_API_KEY.',
      })
    }
    throw createError({ statusCode: 500, message })
  }
})
