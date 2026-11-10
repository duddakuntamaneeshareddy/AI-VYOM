import { NextRequest, NextResponse } from "next/server"

import { getCurrentUser } from "@/lib/auth/supabase-auth"
import { addProductReview, getProductReviews } from "@/lib/db/queries"
import type { ProductReview } from "@/lib/db/types"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const reviews = await getProductReviews(id)
    return NextResponse.json({ reviews })
  } catch (error) {
    console.error("List product reviews error:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch reviews",
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: productId } = await params
    const body = (await request.json()) as { rating?: number; comment?: string }
    const { rating, comment } = body

    if (
      typeof rating !== "number" ||
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      return NextResponse.json(
        { error: "Rating must be an integer between 1 and 5" },
        { status: 400 }
      )
    }

    if (!comment || typeof comment !== "string" || comment.trim().length === 0) {
      return NextResponse.json(
        { error: "Comment is required" },
        { status: 400 }
      )
    }

    const review = await addProductReview({
      productId,
      userId: user.id,
      rating,
      comment: comment.trim(),
    })

    return NextResponse.json({ review: review as ProductReview }, { status: 201 })
  } catch (error) {
    console.error("Create product review error:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create review",
      },
      { status: 500 }
    )
  }
}
