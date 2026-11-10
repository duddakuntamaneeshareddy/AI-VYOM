import { NextRequest, NextResponse } from "next/server"

import { requireAdmin } from "@/lib/auth/supabase-auth"
import { createCampaign, getCampaigns } from "@/lib/db/queries"
import type { CampaignSegment } from "@/lib/db/types"

const VALID_SEGMENTS: CampaignSegment[] = ["all", "cart_abandoners", "recent_buyers"]

export async function GET() {
  try {
    await requireAdmin()

    const campaigns = await getCampaigns()
    return NextResponse.json({ campaigns })
  } catch (error) {
    console.error("List campaigns route error:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch campaigns",
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const body = (await request.json()) as {
      name?: string
      template_id?: string | null
      target_segment?: CampaignSegment
    }

    const { name, template_id, target_segment } = body

    if (!name || !target_segment) {
      return NextResponse.json(
        { error: "Campaign name and target segment are required" },
        { status: 400 }
      )
    }

    if (!VALID_SEGMENTS.includes(target_segment)) {
      return NextResponse.json(
        { error: "Invalid target segment" },
        { status: 400 }
      )
    }

    const campaign = await createCampaign({
      name,
      template_id: template_id ?? null,
      target_segment,
      status: "draft",
    })

    return NextResponse.json({ campaign }, { status: 201 })
  } catch (error) {
    console.error("Create campaign route error:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create campaign",
      },
      { status: 500 }
    )
  }
}
