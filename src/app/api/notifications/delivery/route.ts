import { NextRequest, NextResponse } from "next/server"

import { requireAdmin } from "@/lib/auth/supabase-auth"
import { createServerSupabaseClient } from "@/lib/db/supabase-server"
import { notificationService } from "@/lib/notifications"
import type { OrderStatus } from "@/lib/db/types"

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const body = (await request.json()) as {
      orderId?: string
      newStatus?: OrderStatus
    }
    const { orderId, newStatus } = body

    if (!orderId || !newStatus) {
      return NextResponse.json(
        { error: "orderId and newStatus are required" },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select("*, product:products(*)")
      .eq("order_id", orderId)

    if (itemsError) {
      console.error("Delivery notification items error:", itemsError)
      return NextResponse.json({ error: itemsError.message }, { status: 500 })
    }

    const orderWithItems = {
      ...order,
      items: (items ?? []).map((item) => ({
        name: (item.product as { name: string }).name,
        quantity: item.quantity,
        product: item.product,
      })),
    }

    await notificationService.sendDeliveryUpdate(
      order.user_id,
      orderWithItems,
      newStatus
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delivery notification route error:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to send delivery notification",
      },
      { status: 500 }
    )
  }
}
