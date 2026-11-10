import { NextRequest, NextResponse } from 'next/server'

import { getCurrentUser } from '@/lib/auth/supabase-auth'
import { createServerSupabaseClient } from '@/lib/db/supabase-server'

interface VoiceLogBody {
  chatLogId: string
  durationSeconds: number
  sttText: string
  ttsAudioUrl?: string
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as VoiceLogBody
    const { chatLogId, durationSeconds, sttText, ttsAudioUrl } = body

    if (!chatLogId || typeof chatLogId !== 'string') {
      return NextResponse.json(
        { error: 'chatLogId is required' },
        { status: 400 }
      )
    }

    if (!sttText || typeof sttText !== 'string') {
      return NextResponse.json(
        { error: 'sttText is required' },
        { status: 400 }
      )
    }

    await getCurrentUser()

    const supabase = await createServerSupabaseClient()
    const { error } = await supabase.from('voice_logs').insert({
      chat_log_id: chatLogId,
      duration_seconds: Math.max(0, Math.round(durationSeconds)),
      stt_text: sttText,
      tts_audio_url: ttsAudioUrl ?? null,
    })

    if (error) {
      console.error('Voice log insert error:', error)
      return NextResponse.json(
        { error: 'Failed to save voice log' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Voice log API error:', error)
    return NextResponse.json(
      { error: 'Failed to save voice log' },
      { status: 500 }
    )
  }
}
