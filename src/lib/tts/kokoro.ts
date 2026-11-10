import { TTSService } from './tts-service'

export class KokoroTTSService implements TTSService {
  private serviceUrl: string

  constructor(serviceUrl?: string) {
    this.serviceUrl = (serviceUrl ?? process.env.KOKORO_SERVICE_URL ?? 'http://localhost:8000').replace(/\/$/, '')
  }

  async synthesize(
    text: string,
    voice?: string,
    signal?: AbortSignal
  ): Promise<ArrayBuffer> {
    const response = await fetch(`${this.serviceUrl}/synthesize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        voice: voice ?? 'af_bella',
      }),
      signal,
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      throw new Error(`Kokoro TTS request failed (${response.status}): ${errorText}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    return arrayBuffer
  }
}
