import { NextRequest, NextResponse } from 'next/server'

import { aiProvider, AIMessage } from '@/lib/ai'
import { resolveActions } from '@/lib/ai/action-resolver'
import { buildContext } from '@/lib/ai/context-builder'
import { detectIntent, extractEntities } from '@/lib/ai/intent-router'
import { PROMPTS_BY_INTENT } from '@/lib/ai/prompts'
import type { PageContext } from '@/lib/ai/types'
import { getCurrentUser } from '@/lib/auth/supabase-auth'
import { createServerSupabaseClient } from '@/lib/db/supabase-server'

interface ChatRequestBody {
  message: string
  history: AIMessage[]
  mode?: 'text' | 'voice'
  pageContext?: PageContext
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ response: 'Please log in first.' })
    }

    const body = (await request.json()) as ChatRequestBody
    const { message, history = [], mode = 'text', pageContext } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    const userId = user.id

    const intent = detectIntent(message)
    const entities = extractEntities(message)
    const { context, cartItems, products } = await buildContext(
      intent,
      userId,
      entities,
      pageContext
    )

    const systemPrompt = PROMPTS_BY_INTENT[intent].replace(
      '{{CONTEXT}}',
      context
    )

    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-10),
      { role: 'user', content: message },
    ]

    const response = await aiProvider.chat(messages, {
      temperature: 0.5,
      maxTokens: 512,
    })

    const actions = resolveActions({
      userMessage: message,
      aiResponse: response,
      intent,
      context,
      pageContext,
      cartItems,
      products,
    })

    let chatLogId: string | undefined

    if (userId) {
      try {
        const supabase = await createServerSupabaseClient()
        const { data, error } = await supabase
          .from('chat_logs')
          .insert({
            user_id: userId,
            mode,
            messages: [
              ...history,
              { role: 'user', content: message },
              { role: 'assistant', content: response },
            ],
          })
          .select('id')
          .single()

        if (!error && data) {
          chatLogId = data.id
        }
      } catch (logError) {
        console.error('Failed to save chat log:', logError)
      }
    }

    return NextResponse.json({ response, intent, chatLogId, actions })
  } catch (error) {
    console.error('AI chat error:', error)
    return NextResponse.json(
      {
        error: 'Failed to process chat message',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
