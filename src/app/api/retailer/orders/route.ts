import { NextResponse } from "next/server"

import { requireRetailer } from "@/lib/auth/supabase-auth"
import { getRetailerOrders } from "@/lib/db/queries"

export async function GET() {
  try {
    const profile = await requireRetailer()
    const orders = await getRetailerOrders(profile.id)
    return NextResponse.json({ orders })
  } catch (error) {
    console.error("List retailer orders error:", error)

    const message = error instanceof Error ? error.message : "Failed to fetch orders"
    if (message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (message.includes("retailer access required")) {
      return NextResponse.json({ error: message }, { status: 403 })
    }

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
