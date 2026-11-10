import { NextRequest, NextResponse } from "next/server"

import { requireAdmin } from "@/lib/auth/supabase-auth"
import { createServerSupabaseClient } from "@/lib/db/supabase-server"
import { notificationService } from "@/lib/notifications"
import type { Order, OrderStatus } from "@/lib/db/types"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin()

    const { id } = await params
    const body = (await request.json()) as { status?: OrderStatus }
    const { status } = body

    if (!status) {
      return NextResponse.json(
        { error: "status is required" },
        { status: 400 }
      )
    }

    const validStatuses: OrderStatus[] = [
      "pending",
      "confirmed",
      "shipped",
      "delivered",
      "cancelled",
    ]

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid order status" },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()

    const { data: order, error } = await supabase
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error || !order) {
      console.error("Update order status error:", error)
      return NextResponse.json(
        { error: error?.message ?? "Failed to update order status" },
        { status: 500 }
      )
    }

    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select("*, product:products(*)")
      .eq("order_id", id)

    if (itemsError) {
      console.error("Order status items error:", itemsError)
    }

    const orderWithItems = {
      ...order,
      items: (items ?? []).map((item) => ({
        name: (item.product as { name: string }).name,
        quantity: item.quantity,
        product: item.product,
      })),
    }

    // Trigger delivery update notification asynchronously; don't fail the request if it errors.
    notificationService
      .sendDeliveryUpdate(order.user_id, orderWithItems, status)
      .catch((err) => {
        console.error("Failed to send delivery notification:", err)
      })

    return NextResponse.json({ order: order as Order })
  } catch (error) {
    console.error("Update order status route error:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update order status",
      },
      { status: 500 }
    )
  }
}
