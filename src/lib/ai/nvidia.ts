import { AIProvider, AIMessage, ChatOptions } from './provider'

interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string
    }
    delta?: {
      content?: string
    }
  }>
}

export class NvidiaNIMProvider implements AIProvider {
  private apiKey: string
  private baseUrl: string
  private model: string

  constructor(
    apiKey?: string,
    baseUrl?: string,
    model?: string
  ) {
    this.apiKey = apiKey ?? process.env.NVIDIA_API_KEY!
    this.baseUrl = baseUrl ?? process.env.NVIDIA_BASE_URL ?? 'https://integrate.api.nvidia.com/v1'
    this.model = model ?? process.env.NVIDIA_MODEL ?? 'nvidia/llama-3.3-nemotron-super-49b-v1'
  }

  private get endpoint() {
    return `${this.baseUrl.replace(/\/$/, '')}/chat/completions`
  }

  private cleanResponse(content: string): string {
    return content
      .replace(/<think>[\s\S]*?<\/think>/gi, '')
      .replace(/<\/think>/gi, '')
      .replace(/<think>/gi, '')
      .replace(/<thinking>[\s\S]*?<\/thinking>/gi, '')
      .replace(/<\/thinking>/gi, '')
      .replace(/<thinking>/gi, '')
      .trim()
  }

  private createStreamCleaner(): {
    push(chunk: string): string[]
    flush(): string
  } {
    const openingTags = ['<think>', '<thinking>'] as const

    let buffer = ''
    let inThink = false
    let thinkTag: 'think' | 'thinking' | null = null

    const findPartialPrefix = (text: string): string | null => {
      const lower = text.toLowerCase()
      const maxPrefixLen = Math.max(...openingTags.map((t) => t.length)) - 1
      for (let len = Math.min(lower.length, maxPrefixLen); len >= 1; len--) {
        const suffix = lower.slice(-len)
        if (openingTags.some((tag) => tag.startsWith(suffix))) {
          return text.slice(-len)
        }
      }
      return null
    }

    return {
      push(chunk: string): string[] {
        buffer += chunk
        const out: string[] = []

        while (true) {
          if (inThink && thinkTag) {
            const closeTag = thinkTag === 'think' ? '</think>' : '</thinking>'
            const idx = buffer.toLowerCase().indexOf(closeTag)
            if (idx === -1) {
              return out
            }
            buffer = buffer.slice(idx + closeTag.length)
            inThink = false
            thinkTag = null
            continue
          }

          const match = /<(think|thinking)>/i.exec(buffer)
          if (match) {
            const safe = buffer.slice(0, match.index)
            buffer = buffer.slice(match.index)
            inThink = true
            thinkTag = match[1].toLowerCase() as 'think' | 'thinking'
            out.push(safe)
            continue
          }

          const partial = findPartialPrefix(buffer)
          if (partial) {
            out.push(buffer.slice(0, -partial.length))
            buffer = partial
          } else {
            out.push(buffer)
            buffer = ''
          }
          return out
        }
      },

      flush(): string {
        if (inThink) {
          return ''
        }
        return buffer
      },
    }
  }

  private buildBody(messages: AIMessage[], options: ChatOptions) {
    return {
      model: this.model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 1024,
      stream: options.stream ?? false,
    }
  }

  async chat(messages: AIMessage[], options: ChatOptions = {}): Promise<string> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(this.buildBody(messages, { ...options, stream: false })),
    })

    if (!response.ok) {
      const text = await response.text().catch(() => 'Unknown error')
      throw new Error(`NVIDIA NIM request failed (${response.status}): ${text}`)
    }

    const data = (await response.json()) as ChatCompletionResponse
    const content = data.choices?.[0]?.message?.content

    if (typeof content !== 'string') {
      throw new Error('NVIDIA NIM returned an empty response.')
    }

    return this.cleanResponse(content)
  }

  async *stream(messages: AIMessage[], options: ChatOptions = {}): AsyncGenerator<string> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(this.buildBody(messages, { ...options, stream: true })),
    })

    if (!response.ok) {
      const text = await response.text().catch(() => 'Unknown error')
      throw new Error(`NVIDIA NIM streaming request failed (${response.status}): ${text}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('NVIDIA NIM streaming response has no readable body.')
    }

    const decoder = new TextDecoder()
    let buffer = ''
    const cleaner = this.createStreamCleaner()

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed || trimmed.startsWith(':')) continue
          if (!trimmed.startsWith('data:')) continue

          const data = trimmed.slice(5).trim()
          if (data === '[DONE]') {
            const final = cleaner.flush()
            if (final) yield final
            return
          }

          try {
            const parsed = JSON.parse(data) as ChatCompletionResponse
            const chunk = parsed.choices?.[0]?.delta?.content
            if (chunk) {
              for (const safe of cleaner.push(chunk)) {
                if (safe) yield safe
              }
            }
          } catch {
            // Ignore malformed SSE chunks.
          }
        }
      }

      const final = cleaner.flush()
      if (final) yield final
    } finally {
      reader.releaseLock()
    }
  }
}
