import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/supabase-auth"
import { createServerSupabaseClient } from "@/lib/db/supabase-server"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { itemId } = await params

  if (!itemId) {
    return NextResponse.json({ error: "Missing itemId" }, { status: 400 })
  }

  const supabase = await createServerSupabaseClient()
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
