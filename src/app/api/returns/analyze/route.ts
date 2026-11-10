import { NextRequest, NextResponse } from "next/server"

import { aiProvider, AIMessage } from "@/lib/ai"
import { RETURN_ANALYSIS_PROMPT } from "@/lib/ai/prompts"
import { getCurrentUser } from "@/lib/auth/supabase-auth"

export type ReturnResolution =
  | "refund"
  | "replacement"
  | "decline"
  | "review_needed"

export type ReturnConfidence = "high" | "medium" | "low"

export interface ReturnAnalysis {
  suggested_resolution: ReturnResolution
  confidence: ReturnConfidence
  summary: string
  follow_up_questions: string[]
}

interface AnalyzeRequestBody {
  reason: string
  orderItem: {
    product_name: string
    price: number
    quantity: number
  }
}

function getDefaultAnalysis(): ReturnAnalysis {
  return {
    suggested_resolution: "review_needed",
    confidence: "low",
    summary:
      "We couldn't automatically analyze this request. A human reviewer will look into it.",
    follow_up_questions: [
      "Could you provide photos of the item?",
      "When did you first notice the issue?",
    ],
  }
}

function parseAnalysisResponse(content: string): ReturnAnalysis {
  const defaultAnalysis = getDefaultAnalysis()

  try {
    const normalized = content.trim()
    const jsonMatch = normalized.match(/\{[\s\S]*\}/)
    const jsonString = jsonMatch ? jsonMatch[0] : normalized
    const parsed = JSON.parse(jsonString) as Partial<ReturnAnalysis>

    const resolutions: ReturnResolution[] = [
      "refund",
      "replacement",
      "decline",
      "review_needed",
    ]
    const confidences: ReturnConfidence[] = ["high", "medium", "low"]

    return {
      suggested_resolution:
        parsed.suggested_resolution &&
        resolutions.includes(parsed.suggested_resolution)
          ? parsed.suggested_resolution
          : defaultAnalysis.suggested_resolution,
      confidence:
        parsed.confidence && confidences.includes(parsed.confidence)
          ? parsed.confidence
          : defaultAnalysis.confidence,
      summary:
        typeof parsed.summary === "string" && parsed.summary.trim().length > 0
          ? parsed.summary.trim()
          : defaultAnalysis.summary,
      follow_up_questions: Array.isArray(parsed.follow_up_questions)
        ? parsed.follow_up_questions.filter((q): q is string =>
            typeof q === "string"
          )
        : defaultAnalysis.follow_up_questions,
    }
  } catch {
    return defaultAnalysis
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = (await request.json()) as AnalyzeRequestBody
    const { reason, orderItem } = body

    if (!reason || typeof reason !== "string") {
      return NextResponse.json(
        { error: "Return reason is required" },
        { status: 400 }
      )
    }

    if (
      !orderItem ||
      typeof orderItem.product_name !== "string" ||
      typeof orderItem.price !== "number" ||
      typeof orderItem.quantity !== "number"
    ) {
      return NextResponse.json(
        { error: "Valid order item details are required" },
        { status: 400 }
      )
    }

    const context = `Product: ${orderItem.product_name}\nPrice: $${orderItem.price.toFixed(
      2
    )}\nQuantity: ${orderItem.quantity}\n\nReturn reason: ${reason}`

    const systemPrompt = `${RETURN_ANALYSIS_PROMPT}\n\nYou MUST respond with a single valid JSON object (no markdown, no extra text) with this exact structure:\n{\n  "suggested_resolution": "refund" | "replacement" | "decline" | "review_needed",\n  "confidence": "high" | "medium" | "low",\n  "summary": "brief explanation",\n  "follow_up_questions": ["question 1", "question 2"]\n}\n\nContext:\n${context}`

    const messages: AIMessage[] = [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Analyze this return request and respond with valid JSON only:\n\n${context}`,
      },
    ]

    const response = await aiProvider.chat(messages, {
      temperature: 0.3,
      maxTokens: 1024,
    })

    const analysis = parseAnalysisResponse(response)

    return NextResponse.json({ analysis })
  } catch (error) {
    console.error("Return analysis error:", error)
    return NextResponse.json(
      {
        analysis: getDefaultAnalysis(),
        error:
          error instanceof Error ? error.message : "Failed to analyze return",
      },
      { status: 200 }
    )
  }
}
