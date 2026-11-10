import { NextRequest, NextResponse } from "next/server"

import { getCurrentUser, getUserProfile } from "@/lib/auth/supabase-auth"
import { createServerSupabaseClient } from "@/lib/db/supabase-server"
import { notificationService } from "@/lib/notifications"
import type { ReturnStatus } from "@/lib/db/types"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const profile = await getUserProfile()
    const isAdmin = profile?.role === "admin"
    const { id } = await params

    const supabase = await createServerSupabaseClient()
    const query = supabase
      .from("returns")
      .select("*, order:orders(*), order_item:order_items(*, product:products(*))")
      .eq("id", id)

    if (!isAdmin) {
      query.eq("user_id", user.id)
    }

    const { data, error } = await query.single()

    if (error || !data) {
      return NextResponse.json(
        { error: "Return not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ return: data })
  } catch (error) {
    console.error("Get return error:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch return",
      },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const profile = await getUserProfile()
    if (!profile || profile.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: admin access required" },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = (await request.json()) as { status: ReturnStatus }
    const { status } = body

    const validStatuses: ReturnStatus[] = [
      "pending",
      "reviewed",
      "approved",
      "declined",
      "processed",
    ]

    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Valid status is required" },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()

    const updateData: { status: ReturnStatus; resolved_at?: string } = { status }
    if (
      status === "approved" ||
      status === "declined" ||
      status === "processed"
    ) {
      updateData.resolved_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from("returns")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error || !data) {
      console.error("Update return status error:", error)
      return NextResponse.json(
        { error: error?.message ?? "Failed to update return status" },
        { status: 500 }
      )
    }

    // Trigger return-update notification asynchronously; don't fail the request if it errors.
    notificationService
      .sendReturnUpdate(data.user_id, data, status)
      .catch((err) => {
        console.error("Failed to send return update notification:", err)
      })

    return NextResponse.json({ return: data })
  } catch (error) {
    console.error("Update return status route error:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update return status",
      },
      { status: 500 }
    )
  }
}
