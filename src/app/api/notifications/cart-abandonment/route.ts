import { NextRequest, NextResponse } from "next/server"

import { requireAdmin } from "@/lib/auth/supabase-auth"
import { createServerSupabaseClient } from "@/lib/db/supabase-server"
import { notificationService } from "@/lib/notifications"

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const body = (await request.json()) as { userId?: string }
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()
    const { data: cartItems, error } = await supabase
      .from("cart")
      .select("*, product:products(*)")
      .eq("user_id", userId)

    if (error) {
      console.error("Cart abandonment fetch error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { error: "No cart items found for user" },
        { status: 400 }
      )
    }

    const formattedItems = cartItems.map((item) => ({
      name: (item.product as { name: string }).name,
      price: (item.product as { price: number }).price,
      quantity: item.quantity,
    }))

    await notificationService.sendCartAbandonment(userId, formattedItems)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Cart abandonment route error:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to send cart abandonment notification",
      },
      { status: 500 }
    )
  }
}
