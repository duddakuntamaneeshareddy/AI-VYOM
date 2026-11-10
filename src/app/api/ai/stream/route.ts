import { NextRequest } from 'next/server'

import { aiProvider, AIMessage } from '@/lib/ai'
import { resolveActions } from '@/lib/ai/action-resolver'
import { buildContext } from '@/lib/ai/context-builder'
import { detectIntent, extractEntities } from '@/lib/ai/intent-router'
import { PROMPTS_BY_INTENT } from '@/lib/ai/prompts'
import type { PageContext } from '@/lib/ai/types'
import { getCurrentUser } from '@/lib/auth/supabase-auth'
import { createServerSupabaseClient } from '@/lib/db/supabase-server'

interface StreamRequestBody {
  message: string
  history: AIMessage[]
  mode?: 'text' | 'voice'
  pageContext?: PageContext
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      const message = 'Please log in first.'
      const gatedStream = new ReadableStream({
        start(controller) {
          controller.enqueue(
            new TextEncoder().encode(
              `data: ${JSON.stringify({ content: message })}\n\n`
            )
          )
          controller.enqueue(
            new TextEncoder().encode('data: [DONE]\n\n')
          )
          controller.close()
        },
      })

      return new Response(gatedStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      })
    }

    const body = (await request.json()) as StreamRequestBody
    const { message, history = [], mode = 'text', pageContext } = body

    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
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

    const stream = aiProvider.stream(messages, {
      temperature: 0.7,
      maxTokens: 1024,
    })

    const fullResponseParts: string[] = []

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            fullResponseParts.push(chunk)
            const payload = JSON.stringify({ content: chunk })
            controller.enqueue(
              new TextEncoder().encode(`data: ${payload}\n\n`)
            )
          }

          const actions = resolveActions({
            userMessage: message,
            aiResponse: fullResponseParts.join(''),
            intent,
            context,
            pageContext,
            cartItems,
            products,
          })

          controller.enqueue(
            new TextEncoder().encode(
              `data: ${JSON.stringify({ actions })}\n\n`
            )
          )

          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'))
          controller.close()

          if (userId) {
            try {
              const supabase = await createServerSupabaseClient()
              await supabase.from('chat_logs').insert({
                user_id: userId,
                mode,
                messages: [
                  ...history,
                  { role: 'user', content: message },
                  { role: 'assistant', content: fullResponseParts.join('') },
                ],
              })
            } catch (logError) {
              console.error('Failed to save chat log:', logError)
            }
          }
        } catch (streamError) {
          console.error('Streaming error:', streamError)
          controller.error(streamError)
        }
      },
    })

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('AI stream error:', error)
    return new Response(
      JSON.stringify({
        error: 'Failed to process streaming request',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
