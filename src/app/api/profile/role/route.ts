import { NextRequest, NextResponse } from "next/server"

import { createServerSupabaseClient } from "@/lib/db/supabase-server"
import { createServiceRoleClient } from "@/lib/db/supabase-service"

const ALLOWED_ROLES = ["customer", "retailer"] as const
type AllowedRole = (typeof ALLOWED_ROLES)[number]

export async function PATCH(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: { role?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const role = body.role
  if (!ALLOWED_ROLES.includes(role as AllowedRole)) {
    return NextResponse.json(
      { error: "Role must be 'customer' or 'retailer'" },
      { status: 400 }
    )
  }

  const service = createServiceRoleClient()
  const { data: profile, error } = await service
    .from("profiles")
    .update({ role: role as AllowedRole })
    .eq("id", user.id)
    .select()
    .single()

  if (error) {
    console.error("PATCH /api/profile/role error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ profile })
}
