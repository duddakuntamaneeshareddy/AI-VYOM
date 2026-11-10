import { NextRequest, NextResponse } from "next/server"

import { requireAdmin } from "@/lib/auth/supabase-auth"
import { getCampaignById, getUsersBySegment } from "@/lib/db/queries"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin()

    const { id } = await params
    const campaign = await getCampaignById(id)

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      )
    }

    const users = await getUsersBySegment(campaign.target_segment)

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Get campaign recipients route error:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch campaign recipients",
      },
      { status: 500 }
    )
  }
}
