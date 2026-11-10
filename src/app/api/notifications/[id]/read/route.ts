import { NextRequest, NextResponse } from "next/server"

import { getCurrentUser } from "@/lib/auth/supabase-auth"
import { createServerSupabaseClient } from "@/lib/db/supabase-server"
import { notificationService } from "@/lib/notifications"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const supabase = await createServerSupabaseClient()
    const { data: notification, error: fetchError } = await supabase
      .from("notifications")
      .select("user_id")
      .eq("id", id)
      .single()

    if (fetchError || !notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      )
    }

    if (notification.user_id !== user.id) {
      return NextResponse.json(
        { error: "Forbidden: notification does not belong to you" },
        { status: 403 }
      )
    }

    await notificationService.markAsRead(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Mark notification read route error:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to mark notification as read",
      },
      { status: 500 }
    )
  }
}
