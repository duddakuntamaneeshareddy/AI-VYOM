import { ReactNode } from 'react'

export interface EmailParams {
  to: string
  subject: string
  html?: string
  react?: ReactNode
  templateId?: string
  variables?: Record<string, string>
}

export interface EmailResult {
  success: boolean
  id?: string
  error?: string
}

export interface EmailService {
  send(params: EmailParams): Promise<EmailResult>
}
