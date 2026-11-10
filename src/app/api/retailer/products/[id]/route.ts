import { NextRequest, NextResponse } from "next/server"

import { requireRetailer } from "@/lib/auth/supabase-auth"
import { createServerSupabaseClient } from "@/lib/db/supabase-server"
import { createServiceRoleClient } from "@/lib/db/supabase-service"

const BUCKET_NAME = "product-images"

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const profile = await requireRetailer()
    const { id } = await params

    const supabase = await createServerSupabaseClient()

    const { data: product, error: fetchError } = await supabase
      .from("products")
      .select("id, retailer_id, image_url")
      .eq("id", id)
      .single()

    if (fetchError || !product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    if (product.retailer_id !== profile.id) {
      return NextResponse.json(
        { error: "Forbidden: you do not own this product" },
        { status: 403 }
      )
    }

    if (product.image_url && product.image_url.includes("/product-images/")) {
      const path = extractStoragePath(product.image_url)
      if (path) {
        try {
          const service = createServiceRoleClient()
          const { error: storageError } = await service.storage
            .from(BUCKET_NAME)
            .remove([path])

          if (storageError) {
            console.error(
              `Failed to delete storage object for product ${id}:`,
              storageError
            )
          }
        } catch (storageError) {
          console.error(
            `Storage cleanup failed for product ${id}:`,
            storageError
          )
        }
      }
    }

    const { error: deleteError } = await supabase
      .from("products")
      .delete()
      .eq("id", id)
      .eq("retailer_id", profile.id)

    if (deleteError) {
      console.error("Delete retailer product error:", deleteError)
      return NextResponse.json(
        { error: deleteError.message ?? "Failed to delete product" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete retailer product error:", error)

    const message = error instanceof Error ? error.message : "Failed to delete product"
    if (message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (message.includes("retailer access required")) {
      return NextResponse.json({ error: message }, { status: 403 })
    }

    return NextResponse.json({ error: message }, { status: 500 })
  }
}

function extractStoragePath(imageUrl: string): string | null {
  const segmentIndex = imageUrl.indexOf("/product-images/")
  if (segmentIndex === -1) return null

  const path = imageUrl.slice(segmentIndex + "/product-images/".length)
  return path ? decodeURIComponent(path) : null
}
