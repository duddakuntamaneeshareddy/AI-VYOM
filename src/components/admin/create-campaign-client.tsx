"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { CampaignForm } from "./campaign-form"
import { toast } from "sonner"
import type { CampaignSegment, EmailTemplate } from "@/lib/db/types"

interface CreateCampaignClientProps {
  templates: EmailTemplate[]
}

export function CreateCampaignClient({ templates }: CreateCampaignClientProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)

  async function handleSubmit(data: {
    name: string
    target_segment: CampaignSegment
    template_id: string
  }) {
    setIsLoading(true)

    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          target_segment: data.target_segment,
          template_id: data.template_id,
        }),
      })

      const json = await res.json()

      if (!res.ok) {
        toast.error(json.error || "Failed to create campaign")
        return
      }

      toast.success("Campaign created")
      router.push("/admin/campaigns")
      router.refresh()
    } catch {
      toast.error("Failed to create campaign")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mx-auto max-w-lg space-y-6"
    >
      <Button
        variant="ghost"
        className="-ml-2 gap-2"
        onClick={() => router.push("/admin/campaigns")}
      >
        <ArrowLeft className="size-4" />
        Back to campaigns
      </Button>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Create Campaign</h1>
        <p className="text-muted-foreground">
          Build a new retention campaign to re-engage your customers.
        </p>
      </div>

      <div className="surface-bento">
        <CampaignForm
          templates={templates}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </motion.div>
  )
}
