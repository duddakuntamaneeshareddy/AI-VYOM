import { NextRequest, NextResponse } from "next/server"

import { requireRetailer } from "@/lib/auth/supabase-auth"
import { createServiceRoleClient } from "@/lib/db/supabase-service"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const BUCKET_NAME = "product-images"

export async function POST(request: NextRequest) {
  let retailer
  try {
    retailer = await requireRetailer()
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unauthorized"
    const status = message.includes("retailer") ? 403 : 401
    return NextResponse.json({ error: message }, { status })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 })
  }

  const file = formData.get("file")
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File size must be under 5 MB" },
      { status: 400 }
    )
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "Only image files are allowed" },
      { status: 400 }
    )
  }

  const extension = file.name.split(".").pop() || "png"
  const safeName = file.name
    .split(".")
    .slice(0, -1)
    .join(".")
    .replace(/[^a-zA-Z0-9_-]/g, "-")
    .toLowerCase()
  const path = `retailer-${retailer.id}/${Date.now()}-${safeName}-${crypto.randomUUID()}.${extension}`

  const service = createServiceRoleClient()
  const { data: uploadData, error: uploadError } = await service.storage
    .from(BUCKET_NAME)
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    })

  if (uploadError) {
    console.error("Retailer upload error:", uploadError)
    return NextResponse.json(
      { error: uploadError.message },
      { status: 500 }
    )
  }

  const {
    data: { publicUrl },
  } = service.storage.from(BUCKET_NAME).getPublicUrl(uploadData.path)

  return NextResponse.json({ publicUrl })
}
