import { NextRequest, NextResponse } from "next/server"

import { requireRetailer } from "@/lib/auth/supabase-auth"
import { createRetailerProduct, getProductsByRetailer } from "@/lib/db/queries"
import type { Product } from "@/lib/db/types"

export async function GET() {
  try {
    const profile = await requireRetailer()
    const products = await getProductsByRetailer(profile.id)
    return NextResponse.json({ products })
  } catch (error) {
    console.error("List retailer products error:", error)

    const message = error instanceof Error ? error.message : "Failed to fetch products"
    if (message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (message.includes("retailer access required")) {
      return NextResponse.json({ error: message }, { status: 403 })
    }

    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const profile = await requireRetailer()

    const body = (await request.json()) as {
      name?: string
      price?: number
      category?: string
      image_url?: string | null
      stock?: number
      tags?: string[]
      description?: string | null
      specifications?: Record<string, string> | null
    }

    const { name, price, category } = body

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    if (typeof price !== "number" || price < 0) {
      return NextResponse.json(
        { error: "Price must be a non-negative number" },
        { status: 400 }
      )
    }

    if (!category || typeof category !== "string" || category.trim().length === 0) {
      return NextResponse.json({ error: "Category is required" }, { status: 400 })
    }

    const product = await createRetailerProduct({
      retailerId: profile.id,
      name: name.trim(),
      price,
      category: category.trim(),
      image_url: body.image_url,
      stock: body.stock,
      tags: body.tags,
      description: body.description,
      specifications: body.specifications,
    })

    return NextResponse.json({ product: product as Product }, { status: 201 })
  } catch (error) {
    console.error("Create retailer product error:", error)

    const message = error instanceof Error ? error.message : "Failed to create product"
    if (message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (message.includes("retailer access required")) {
      return NextResponse.json({ error: message }, { status: 403 })
    }

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
