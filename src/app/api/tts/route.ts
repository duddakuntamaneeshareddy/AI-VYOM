import { NextRequest, NextResponse } from 'next/server'

import { ttsService } from '@/lib/tts'

interface TTSRequestBody {
  text: string
  voice?: string
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as TTSRequestBody
    const { text, voice } = body

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text is required and cannot be empty' },
        { status: 400 }
      )
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const audioBuffer = await ttsService.synthesize(
      text.trim(),
      voice ?? 'af_bella',
      controller.signal
    )
    clearTimeout(timeoutId)

    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/wav',
        'Cache-Control': 'private, max-age=300',
      },
    })
  } catch (error) {
    console.error('TTS API error:', error)

    const isTimeout =
      error instanceof Error &&
      (error.name === 'AbortError' || error.message.includes('timed out'))

    return NextResponse.json(
      {
        error: isTimeout
          ? 'Kokoro TTS timed out after 10 seconds. The client should fall back to browser speech synthesis.'
          : 'Kokoro TTS service is unavailable. The client should fall back to browser speech synthesis.',
        fallback: 'speech_synthesis',
      },
      { status: 503 }
    )
  }
}
