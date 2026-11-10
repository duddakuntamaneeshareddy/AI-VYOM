import { NextRequest, NextResponse } from "next/server"

import { requireAdmin } from "@/lib/auth/supabase-auth"
import {
  getCampaignById,
  updateCampaign,
  deleteCampaign,
} from "@/lib/db/queries"
import type { CampaignSegment } from "@/lib/db/types"

const VALID_SEGMENTS: CampaignSegment[] = [
  "all",
  "cart_abandoners",
  "recent_buyers",
]

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

    return NextResponse.json({ campaign })
  } catch (error) {
    console.error("Get campaign route error:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch campaign",
      },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin()

    const { id } = await params
    const existing = await getCampaignById(id)

    if (!existing) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      )
    }

    const body = (await request.json()) as {
      name?: string
      template_id?: string | null
      target_segment?: CampaignSegment
      status?: "draft" | "sent"
    }

    if (body.target_segment && !VALID_SEGMENTS.includes(body.target_segment)) {
      return NextResponse.json(
        { error: "Invalid target segment" },
        { status: 400 }
      )
    }

    const campaign = await updateCampaign(id, {
      name: body.name,
      template_id: body.template_id,
      target_segment: body.target_segment,
      status: body.status,
    })

    return NextResponse.json({ campaign })
  } catch (error) {
    console.error("Update campaign route error:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update campaign",
      },
      { status: 500 }
    )
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin()

    const { id } = await params
    const existing = await getCampaignById(id)

    if (!existing) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      )
    }

    if (existing.status !== "draft") {
      return NextResponse.json(
        { error: "Only draft campaigns can be deleted" },
        { status: 400 }
      )
    }

    await deleteCampaign(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete campaign route error:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete campaign",
      },
      { status: 500 }
    )
  }
}
