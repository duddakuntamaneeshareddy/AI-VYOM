import { NextRequest, NextResponse } from "next/server"

import { getCurrentUser } from "@/lib/auth/supabase-auth"
import { createServerSupabaseClient } from "@/lib/db/supabase-server"

interface CreateReturnBody {
  order_id: string
  order_item_id: string
  reason: string
  ai_analysis: Record<string, unknown>
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = (await request.json()) as CreateReturnBody
    const { order_id, order_item_id, reason, ai_analysis } = body

    if (!order_id || !order_item_id || !reason) {
      return NextResponse.json(
        { error: "Order ID, order item ID, and reason are required" },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, user_id, status")
      .eq("id", order_id)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (order.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { data: orderItem, error: itemError } = await supabase
      .from("order_items")
      .select("id, order_id")
      .eq("id", order_item_id)
      .eq("order_id", order_id)
      .single()

    if (itemError || !orderItem) {
      return NextResponse.json(
        { error: "Order item not found" },
        { status: 404 }
      )
    }

    const { data: returnRecord, error } = await supabase
      .from("returns")
      .insert({
        order_id,
        order_item_id,
        user_id: user.id,
        reason,
        ai_analysis: ai_analysis ?? {},
        status: "pending",
      })
      .select()
      .single()

    if (error || !returnRecord) {
      console.error("Create return error:", error)
      return NextResponse.json(
        { error: error?.message ?? "Failed to create return" },
        { status: 500 }
      )
    }

    return NextResponse.json({ return: returnRecord })
  } catch (error) {
    console.error("Create return route error:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create return",
      },
      { status: 500 }
    )
  }
}
