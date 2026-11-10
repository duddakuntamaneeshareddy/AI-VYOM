import { NextRequest, NextResponse } from "next/server"

import { requireAdmin } from "@/lib/auth/supabase-auth"
import { createServerSupabaseClient } from "@/lib/db/supabase-server"
import type { Product } from "@/lib/db/types"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin()

    const { id } = await params
    const body = (await request.json()) as Partial<Product>

    const supabase = await createServerSupabaseClient()
    const { data: product, error } = await supabase
      .from("products")
      .update(body)
      .eq("id", id)
      .select()
      .single()

    if (error || !product) {
      console.error("Update product error:", error)
      return NextResponse.json(
        { error: error?.message ?? "Failed to update product" },
        { status: 500 }
      )
    }

    return NextResponse.json({ product: product as Product })
  } catch (error) {
    console.error("Update product route error:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update product",
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin()

    const { id } = await params
    const supabase = await createServerSupabaseClient()

    const { error } = await supabase.from("products").delete().eq("id", id)

    if (error) {
      console.error("Delete product error:", error)
      return NextResponse.json(
        { error: error.message ?? "Failed to delete product" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete product route error:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete product",
      },
      { status: 500 }
    )
  }
}
