import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/supabase-auth"
import { createServerSupabaseClient } from "@/lib/db/supabase-server"

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { shipping_address } = body

  if (!shipping_address) {
    return NextResponse.json(
      { error: "Shipping address is required" },
      { status: 400 }
    )
  }

  const supabase = await createServerSupabaseClient()

  const { data: cartItems, error: cartError } = await supabase
    .from("cart")
    .select("*, product:products(*)")
    .eq("user_id", user.id)

  if (cartError) {
    return NextResponse.json({ error: cartError.message }, { status: 500 })
  }

  if (!cartItems || cartItems.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 })
  }

  const total = cartItems.reduce((sum, item) => {
    const price = (item.product as { price: number }).price
    return sum + price * item.quantity
  }, 0)

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      total,
      shipping_address,
      status: "pending",
    })
    .select()
    .single()

  if (orderError || !order) {
    return NextResponse.json({ error: orderError?.message }, { status: 500 })
  }

  const orderItems = cartItems.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    price_at_purchase: (item.product as { price: number }).price,
  }))

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems)

  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 500 })
  }

  const { error: clearCartError } = await supabase
    .from("cart")
    .delete()
    .eq("user_id", user.id)

  if (clearCartError) {
    return NextResponse.json({ error: clearCartError.message }, { status: 500 })
  }

  return NextResponse.json({ orderId: order.id })
}
