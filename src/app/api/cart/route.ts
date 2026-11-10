import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/supabase-auth"
import { createServerSupabaseClient } from "@/lib/db/supabase-server"

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from("cart")
    .select("*, product:products(*)")
    .eq("user_id", user.id)
    .order("added_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ items: data ?? [] })
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { product_id, quantity = 1 } = body

  if (!product_id || typeof quantity !== "number" || quantity < 1) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }

  const supabase = await createServerSupabaseClient()

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("stock")
    .eq("id", product_id)
    .single()

  if (productError || !product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 })
  }

  if (product.stock < quantity) {
    return NextResponse.json({ error: "Not enough stock" }, { status: 400 })
  }

  const { data: existingItem } = await supabase
    .from("cart")
    .select("id, quantity")
    .eq("user_id", user.id)
    .eq("product_id", product_id)
    .maybeSingle()

  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity
    if (product.stock < newQuantity) {
      return NextResponse.json({ error: "Not enough stock" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("cart")
      .update({ quantity: newQuantity })
      .eq("id", existingItem.id)
      .select("*, product:products(*)")
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ item: data })
  }

  const { data, error } = await supabase
    .from("cart")
    .insert({ user_id: user.id, product_id, quantity })
    .select("*, product:products(*)")
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ item: data })
}

export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { item_id, quantity } = body

  if (!item_id || typeof quantity !== "number" || quantity < 1) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }

  const supabase = await createServerSupabaseClient()

  const { data: cartItem, error: cartError } = await supabase
    .from("cart")
    .select("*, product:products(stock)")
    .eq("id", item_id)
    .eq("user_id", user.id)
    .single()

  if (cartError || !cartItem) {
    return NextResponse.json({ error: "Cart item not found" }, { status: 404 })
  }

  if ((cartItem.product as { stock: number }).stock < quantity) {
    return NextResponse.json({ error: "Not enough stock" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("cart")
    .update({ quantity })
    .eq("id", item_id)
    .eq("user_id", user.id)
    .select("*, product:products(*)")
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ item: data })
}

export async function DELETE(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const itemId = searchParams.get("itemId")
  const clearAll = searchParams.get("clearAll")

  const supabase = await createServerSupabaseClient()

  // Clear entire cart for this user
  if (clearAll === "true") {
    const { error } = await supabase
      .from("cart")
      .delete()
      .eq("user_id", user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  }

  // Remove a single item by ID
  if (!itemId) {
    return NextResponse.json({ error: "Missing itemId" }, { status: 400 })
  }

  const { error } = await supabase
    .from("cart")
    .delete()
    .eq("id", itemId)
    .eq("user_id", user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

