import { redirect } from "next/navigation"

import { requireAdmin } from "@/lib/auth/supabase-auth"
import { getCampaigns } from "@/lib/db/queries"
import { CampaignList } from "@/components/admin/campaign-list"

export default async function CampaignsAdminPage() {
  try {
    await requireAdmin()
  } catch {
    redirect("/login")
  }

  const campaigns = await getCampaigns()

  return (
    <main className="flex-1 px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <CampaignList campaigns={campaigns} />
      </div>
    </main>
  )
}
