import { redirect } from "next/navigation"

import { requireAdmin } from "@/lib/auth/supabase-auth"
import { getEmailTemplates } from "@/lib/db/queries"
import { CreateCampaignClient } from "@/components/admin/create-campaign-client"

export default async function CreateCampaignPage() {
  try {
    await requireAdmin()
  } catch {
    redirect("/login")
  }

  const templates = await getEmailTemplates()

  return (
    <main className="flex-1 px-6 py-12">
      <CreateCampaignClient templates={templates} />
    </main>
  )
}
