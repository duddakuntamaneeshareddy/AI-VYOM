import { Resend } from 'resend'
import { EmailParams, EmailResult, EmailService } from './email-service'

const DEFAULT_FROM = 'onboarding@resend.dev'

export class ResendEmailService implements EmailService {
  private client: Resend
  private from: string

  constructor(apiKey?: string, from = DEFAULT_FROM) {
    this.client = new Resend(apiKey ?? process.env.RESEND_API_KEY!)
    this.from = from
  }

  async send(params: EmailParams): Promise<EmailResult> {
    try {
      if (params.templateId) {
        // Template-based emails are resolved by the caller before reaching this layer.
        throw new Error('Template resolution is not implemented in ResendEmailService. Pass html or react instead.')
      }

      type CreateEmailOptions = Parameters<Resend['emails']['send']>[0]

      const payload: CreateEmailOptions = {
        from: this.from,
        to: params.to,
        subject: params.subject,
        ...(params.react
          ? { react: params.react }
          : { html: params.html ?? '' }),
      }

      const { data, error } = await this.client.emails.send(payload)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, id: data?.id }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      return { success: false, error: message }
    }
  }
}
