"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Plus, Megaphone } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { CampaignCard } from "./campaign-card"
import { SendCampaignDialog } from "./send-campaign-dialog"
import { cn } from "@/lib/utils"
import type { Campaign } from "@/lib/db/types"

interface CampaignListProps {
  campaigns: Campaign[]
}

export function CampaignList({ campaigns }: CampaignListProps) {
  const router = useRouter()
  const [selectedCampaign, setSelectedCampaign] = React.useState<Campaign | null>(null)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [recipientCount, setRecipientCount] = React.useState(0)

  async function handleSendClick(campaign: Campaign) {
    setSelectedCampaign(campaign)

    try {
      const res = await fetch(`/api/campaigns/${campaign.id}/recipients`)
      const json = res.ok ? await res.json() : { users: [] }
      setRecipientCount(json.users?.length ?? 0)
    } catch {
      setRecipientCount(0)
    }

    setDialogOpen(true)
  }

  async function handleSend() {
    if (!selectedCampaign) {
      return { success: false, sentCount: 0, failedCount: 0, error: "No campaign selected" }
    }

    const res = await fetch(`/api/campaigns/${selectedCampaign.id}/send`, {
      method: "POST",
    })
    const json = await res.json()

    if (!res.ok) {
      return {
        success: false,
        sentCount: 0,
        failedCount: 0,
        error: json.error || "Failed to send campaign",
      }
    }

    router.refresh()
    return json as { success: boolean; sentCount: number; failedCount: number }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="space-y-6"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Retention Campaigns</h1>
            <p className="text-muted-foreground">
              Create, manage, and send email campaigns to re-engage customers.
            </p>
          </div>
          <Link
            href="/admin/campaigns/create"
            className={cn(buttonVariants({ size: "default" }), "rounded-full")}
          >
            <Plus className="mr-2 size-4" />
            Create Campaign
          </Link>
        </div>

        {campaigns.length === 0 ? (
          <div className="surface-bento flex flex-col items-center justify-center py-16 text-center">
            <Megaphone className="mb-4 size-10 text-muted-foreground" />
            <p className="text-lg font-medium">No campaigns yet</p>
            <p className="text-sm text-muted-foreground">
              Create your first retention campaign to start re-engaging customers.
            </p>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.05,
                },
              },
            }}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {campaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                onSendClick={handleSendClick}
              />
            ))}
          </motion.div>
        )}
      </motion.div>

      <SendCampaignDialog
        campaign={selectedCampaign}
        recipientCount={recipientCount}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSend={handleSend}
      />
    </>
  )
}
