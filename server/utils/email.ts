import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'

let sesClient: SESClient | null = null

function getClient(): SESClient | null {
  if (sesClient)
    return sesClient

  const config = useRuntimeConfig()

  if (!config.awsAccessKeyId || !config.awsSecretAccessKey) {
    console.warn('[Email] AWS SES not configured - emails will be logged to console')
    return null
  }

  // Support optional session token for temporary credentials
  const creds: any = {
    accessKeyId: config.awsAccessKeyId,
    secretAccessKey: config.awsSecretAccessKey,
  }
  if (config.awsSessionToken) {
    creds.sessionToken = config.awsSessionToken
  }

  sesClient = new SESClient({
    region: config.awsRegion,
    credentials: creds,
  })

  return sesClient
}

async function sendEmail(to: string, subject: string, htmlBody: string): Promise<void> {
  const config = useRuntimeConfig()
  const client = getClient()

  if (!client) {
    console.log(`[Email] To: ${to}`)
    console.log(`[Email] Subject: ${subject}`)
    console.log(`[Email] Body: ${htmlBody}`)
    return
  }

  const command = new SendEmailCommand({
    Source: config.emailFrom,
    Destination: { ToAddresses: [to] },
    Message: {
      Subject: { Data: subject },
      Body: { Html: { Data: htmlBody } },
    },
  })

  try {
    await client.send(command)
  }
  catch (err: unknown) {
    console.error('[Email] SES send error:', err)
    // Re-throw so callers can handle/log as needed
    throw err
  }
}

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const config = useRuntimeConfig()
  const verifyUrl = `${config.public.appUrl}/verify-email?token=${token}`

  await sendEmail(
    email,
    'Verify your email - TKP People Connect',
    `
      <h2>Welcome to TKP People Connect!</h2>
      <p>Please verify your email address by clicking the link below:</p>
      <p><a href="${verifyUrl}" style="display:inline-block;padding:12px 24px;background:#4f46e5;color:#fff;text-decoration:none;border-radius:6px;">Verify Email</a></p>
      <p>If you didn't create an account, you can safely ignore this email.</p>
      <p>This link will expire in 24 hours.</p>
    `,
  )
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const config = useRuntimeConfig()
  const resetUrl = `${config.public.appUrl}/reset-password?token=${token}`

  await sendEmail(
    email,
    'Reset your password - TKP People Connect',
    `
      <h2>Password Reset Request</h2>
      <p>You requested a password reset. Click the link below to set a new password:</p>
      <p><a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#4f46e5;color:#fff;text-decoration:none;border-radius:6px;">Reset Password</a></p>
      <p>If you didn't request this, you can safely ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
    `,
  )
}

export async function sendRoleChangeNotification(email: string, newRole: string): Promise<void> {
  await sendEmail(
    email,
    'Your role has been updated - TKP People Connect',
    `
      <h2>Role Updated</h2>
      <p>Your account role has been updated to: <strong>${newRole}</strong></p>
      <p>This change affects your access level within the application.</p>
    `,
  )
}
