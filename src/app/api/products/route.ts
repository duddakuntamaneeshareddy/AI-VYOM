import { NextRequest, NextResponse } from "next/server"

import { requireAdmin } from "@/lib/auth/supabase-auth"
import { createServerSupabaseClient } from "@/lib/db/supabase-server"
import type { Product } from "@/lib/db/types"

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("List products error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ products: (data ?? []) as Product[] })
  } catch (error) {
    console.error("List products route error:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch products",
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const body = (await request.json()) as Partial<Product>
    const { name, description, price, stock, category, tags, image_url } = body

    if (!name || typeof price !== "number" || !category) {
      return NextResponse.json(
        { error: "Name, price, and category are required" },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()
    const { data: product, error } = await supabase
      .from("products")
      .insert({
        name,
        description: description ?? null,
        price,
        stock: typeof stock === "number" ? stock : 0,
        category,
        tags: tags ?? [],
        image_url: image_url ?? null,
      })
      .select()
      .single()

    if (error || !product) {
      console.error("Create product error:", error)
      return NextResponse.json(
        { error: error?.message ?? "Failed to create product" },
        { status: 500 }
      )
    }

    return NextResponse.json({ product: product as Product }, { status: 201 })
  } catch (error) {
    console.error("Create product route error:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create product",
      },
      { status: 500 }
    )
  }
}
