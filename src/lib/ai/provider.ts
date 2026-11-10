export interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatOptions {
  temperature?: number
  maxTokens?: number
  stream?: boolean
}

export interface AIProvider {
  chat(messages: AIMessage[], options?: ChatOptions): Promise<string>
  stream(messages: AIMessage[], options?: ChatOptions): AsyncGenerator<string>
}
