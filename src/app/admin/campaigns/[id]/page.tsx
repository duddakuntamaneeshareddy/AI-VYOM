import { redirect, notFound } from "next/navigation"

import { requireAdmin } from "@/lib/auth/supabase-auth"
import {
  getCampaignById,
  getEmailTemplateById,
  getUsersBySegment,
  getCampaignNotifications,
} from "@/lib/db/queries"
import { CampaignDetailClient } from "@/components/admin/campaign-detail-client"

interface CampaignDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function CampaignDetailPage({
  params,
}: CampaignDetailPageProps) {
  try {
    await requireAdmin()
  } catch {
    redirect("/login")
  }

  const { id } = await params
  const campaign = await getCampaignById(id)

  if (!campaign) {
    notFound()
  }

  const [template, recipients, notifications] = await Promise.all([
    campaign.template_id ? getEmailTemplateById(campaign.template_id) : null,
    getUsersBySegment(campaign.target_segment),
    getCampaignNotifications(campaign.id),
  ])

  return (
    <main className="flex-1 px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <CampaignDetailClient
          campaign={campaign}
          template={template}
          recipients={recipients}
          notifications={notifications}
        />
      </div>
    </main>
  )
}
