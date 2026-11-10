import { NextRequest, NextResponse } from "next/server"

import { requireAdmin } from "@/lib/auth/supabase-auth"
import {
  getCampaignById,
  getEmailTemplateById,
  getUsersBySegment,
  updateCampaign,
} from "@/lib/db/queries"
import { notificationService } from "@/lib/notifications"

interface RouteParams {
  params: Promise<{ id: string }>
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim()
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
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

    if (campaign.status === "sent") {
      return NextResponse.json(
        { error: "Campaign has already been sent" },
        { status: 400 }
      )
    }

    let subject = campaign.name
    let message =
      "We miss you! Here is an exclusive offer to welcome you back to AI VYOM."

    if (campaign.template_id) {
      const template = await getEmailTemplateById(campaign.template_id)
      if (template) {
        subject = template.subject || subject
        message = stripHtml(template.body) || message
      }
    }

    const users = await getUsersBySegment(campaign.target_segment)

    let sentCount = 0
    let failedCount = 0

    const offerCode = "COMEBACK20"

    for (const user of users) {
      try {
        const success = await notificationService.sendCampaign(
          user.id,
          campaign.id,
          {
            name: subject,
            offerCode,
            message,
          }
        )

        if (success) {
          sentCount++
        } else {
          failedCount++
        }
      } catch (err) {
        console.error(`Failed to send campaign to user ${user.id}:`, err)
        failedCount++
      }
    }

    await updateCampaign(campaign.id, {
      status: "sent",
      sent_at: new Date().toISOString(),
      sent_count: sentCount,
    })

    return NextResponse.json({
      success: sentCount > 0,
      sentCount,
      failedCount,
    })
  } catch (error) {
    console.error("Send campaign route error:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to send campaign",
      },
      { status: 500 }
    )
  }
}
