import { NextResponse } from "next/server"

import { getCurrentUser } from "@/lib/auth/supabase-auth"
import { notificationService } from "@/lib/notifications"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const notifications = await notificationService.getInAppNotifications(user.id)

    return NextResponse.json({ notifications })
  } catch (error) {
    console.error("Fetch notifications route error:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch notifications",
      },
      { status: 500 }
    )
  }
}
