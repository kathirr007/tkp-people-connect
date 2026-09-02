import type { AiEmailDraft, AiEmailType } from '~~/shared/types/ai'
import { getAiClient } from './ai/client'

const EMAIL_SYSTEM_PROMPT = `You are a professional email writer for TKP People Connect, a community management platform. Generate personalized, warm, and professional emails. Use the person's data to make the email feel personal and relevant. Always include a clear call-to-action.`

const EMAIL_TEMPLATES: Record<AiEmailType, string> = {
  welcome: 'Write a warm welcome email introducing TKP People Connect to a new community member. Mention their name and location. Keep it friendly and encouraging.',
  event: 'Write an event invitation email for an upcoming community event. Make it exciting and include a call-to-action to RSVP or attend.',
  followup: 'Write a friendly follow-up email checking in with the person. Ask about their recent activities or updates. Keep it casual but professional.',
  custom: '',
}

export async function generateEmail(
  personData: Record<string, unknown>,
  personType: 'people' | 'youth',
  emailType: AiEmailType,
  customContext?: string,
  customSubject?: string,
): Promise<AiEmailDraft> {
  const client = await getAiClient()

  const name = `${personData.firstName || ''} ${personData.lastName || ''}`.trim()
  const village = personData.village || personData.ward || 'their area'

  let context = ''
  if (personType === 'youth') {
    const activities = Array.isArray(personData.activities) ? personData.activities.map((a: Record<string, unknown>) => a.name).join(', ') : ''
    const interests = personData.interests || ''
    const careerGoal = personData.careerGoal || personData.career_goal || ''
    const currentlyStudying = personData.currentlyStudying || personData.currently_studying

    context = `Name: ${name}
Location: ${village}
Type: Youth member
Currently studying: ${currentlyStudying ? 'Yes' : 'No'}
${interests ? `Interests: ${interests}` : ''}
${careerGoal ? `Career goal: ${careerGoal}` : ''}
${activities ? `Activities: ${activities}` : ''}`
  }
  else {
    const maritalStatus = personData.maritalStatus || personData.marital_status || ''
    const education = Array.isArray(personData.education) ? personData.education.map((e: Record<string, unknown>) => `${e.level} at ${e.institution || 'unknown'}`).join(', ') : ''

    context = `Name: ${name}
Location: ${village}
Type: Community member
${maritalStatus ? `Marital status: ${maritalStatus}` : ''}
${education ? `Education: ${education}` : ''}`
  }

  const template = emailType === 'custom'
    ? customContext || 'Write a professional email.'
    : `${EMAIL_TEMPLATES[emailType]} The person's details are:\n\n${context}`

  const prompt = `Generate a professional email with subject and body.

Person details:
${context}

${customSubject ? `Required subject line: ${customSubject}` : ''}

Instructions: ${template}

Respond in this exact JSON format:
{
  "subject": "The email subject line",
  "body": "The plain text email body",
  "htmlBody": "The HTML email body with proper formatting (use <p>, <h2>, <strong>, <a> tags)"
}`

  const response = await client.chatCompletion(prompt, EMAIL_SYSTEM_PROMPT)

  try {
    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(cleaned)
    return {
      subject: parsed.subject || 'Hello from TKP People Connect',
      body: parsed.body || '',
      htmlBody: parsed.htmlBody || `<p>${parsed.body || ''}</p>`,
    }
  }
  catch {
    return {
      subject: 'Hello from TKP People Connect',
      body: response,
      htmlBody: `<p>${response.replace(/\n/g, '</p><p>')}</p>`,
    }
  }
}

export async function generateBulkEmail(
  records: Array<Record<string, unknown>>,
  personType: 'people' | 'youth',
  emailType: AiEmailType,
  customContext?: string,
): Promise<AiEmailDraft[]> {
  const drafts: AiEmailDraft[] = []
  for (const record of records) {
    try {
      const draft = await generateEmail(record, personType, emailType, customContext)
      drafts.push(draft)
    }
    catch {
      drafts.push({
        subject: 'Hello from TKP People Connect',
        body: '',
        htmlBody: '',
      })
    }
  }
  return drafts
}
