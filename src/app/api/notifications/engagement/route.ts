import { NextRequest, NextResponse } from "next/server"

import { getCurrentUser } from "@/lib/auth/supabase-auth"
import { notificationService } from "@/lib/notifications"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = (await request.json()) as {
      userId?: string
      message?: string
    }
    const { userId, message } = body

    if (!userId || !message) {
      return NextResponse.json(
        { error: "userId and message are required" },
        { status: 400 }
      )
    }

    // Users may only create engagement notifications for themselves.
    if (userId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden: can only create notifications for yourself" },
        { status: 403 }
      )
    }

    await notificationService.sendEngagement(userId, message)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Engagement notification route error:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create engagement notification",
      },
      { status: 500 }
    )
  }
}
