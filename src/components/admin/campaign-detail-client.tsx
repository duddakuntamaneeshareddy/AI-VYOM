"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  Send,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SendCampaignDialog } from "./send-campaign-dialog"
import { toast } from "sonner"
import type {
  Campaign,
  CampaignSegment,
  EmailTemplate,
  Profile,
  Notification,
} from "@/lib/db/types"

interface CampaignDetailClientProps {
  campaign: Campaign
  template: EmailTemplate | null
  recipients: Profile[]
  notifications: Notification[]
}

const SEGMENT_LABELS: Record<CampaignSegment, string> = {
  all: "All customers",
  cart_abandoners: "Cart abandoners",
  recent_buyers: "Recent buyers",
}

export function CampaignDetailClient({
  campaign,
  template,
  recipients,
  notifications,
}: CampaignDetailClientProps) {
  const router = useRouter()
  const [sendDialogOpen, setSendDialogOpen] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const notificationByUserId = new Map<string, Notification>()
  for (const notification of notifications) {
    if (notification.user_id) {
      notificationByUserId.set(notification.user_id, notification)
    }
  }

  async function handleSend() {
    const res = await fetch(`/api/campaigns/${campaign.id}/send`, {
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
    return json as {
      success: boolean
      sentCount: number
      failedCount: number
    }
  }

  async function handleDelete() {
    if (!window.confirm("Are you sure you want to delete this draft campaign?")) {
      return
    }

    setIsDeleting(true)

    try {
      const res = await fetch(`/api/campaigns/${campaign.id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const json = await res.json()
        toast.error(json.error || "Failed to delete campaign")
        return
      }

      toast.success("Campaign deleted")
      router.push("/admin/campaigns")
      router.refresh()
    } catch {
      toast.error("Failed to delete campaign")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="space-y-8"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <Button
              variant="ghost"
              className="-ml-2 gap-2"
              onClick={() => router.push("/admin/campaigns")}
            >
              <ArrowLeft className="size-4" />
              Back to campaigns
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">{campaign.name}</h1>
          </div>

          <div className="flex items-center gap-2">
            {campaign.status === "draft" && (
              <>
                <Button
                  variant="destructive"
                  className="rounded-full"
                  disabled={isDeleting}
                  onClick={handleDelete}
                >
                  <Trash2 className="mr-2 size-4" />
                  Delete
                </Button>
                <Button
                  className="rounded-full"
                  onClick={() => setSendDialogOpen(true)}
                >
                  <Send className="mr-2 size-4" />
                  Send Campaign
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="surface-bento lg:col-span-1">
            <CardHeader>
              <CardTitle>Campaign info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={campaign.status === "sent" ? "default" : "secondary"}
                >
                  {campaign.status}
                </Badge>
                <Badge variant="outline">
                  {SEGMENT_LABELS[campaign.target_segment]}
                </Badge>
              </div>

              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground">Sent count</p>
                <p className="text-2xl font-bold">{campaign.sent_count}</p>
              </div>

              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground">Created</p>
                <p>{new Date(campaign.created_at).toLocaleString()}</p>
              </div>

              {campaign.sent_at && (
                <div className="space-y-1 text-sm">
                  <p className="text-muted-foreground">Sent at</p>
                  <p>{new Date(campaign.sent_at).toLocaleString()}</p>
                </div>
              )}

              {template && (
                <div className="space-y-1 text-sm">
                  <p className="text-muted-foreground">Email template</p>
                  <p className="font-medium">{template.name}</p>
                  <p className="text-muted-foreground">{template.subject}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="surface-bento lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="size-4" />
                Recipients
                <Badge variant="secondary">{recipients.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recipients.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No users match this segment.
                </div>
              ) : (
                <motion.ul
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: {
                      transition: {
                        staggerChildren: 0.03,
                      },
                    },
                  }}
                  className="divide-y"
                >
                  {recipients.map((recipient) => {
                    const notification = notificationByUserId.get(recipient.id)
                    const status = notification?.status ?? "pending"

                    return (
                      <motion.li
                        key={recipient.id}
                        variants={{
                          hidden: { opacity: 0, y: 8 },
                          visible: { opacity: 1, y: 0 },
                        }}
                        className="flex items-center justify-between py-3"
                      >
                        <div>
                          <p className="font-medium">
                            {recipient.full_name || recipient.email}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {recipient.email}
                          </p>
                        </div>
                        <StatusBadge status={status} />
                      </motion.li>
                    )
                  })}
                </motion.ul>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>

      <SendCampaignDialog
        campaign={campaign}
        recipientCount={recipients.length}
        open={sendDialogOpen}
        onOpenChange={setSendDialogOpen}
        onSend={handleSend}
      />
    </>
  )
}

function StatusBadge({ status }: { status: Notification["status"] | "pending" }) {
  if (status === "sent") {
    return (
      <Badge variant="default" className="gap-1">
        <CheckCircle2 className="size-3" />
        Sent
      </Badge>
    )
  }

  if (status === "failed") {
    return (
      <Badge variant="destructive" className="gap-1">
        <XCircle className="size-3" />
        Failed
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className="gap-1">
      <Clock className="size-3" />
      Pending
    </Badge>
  )
}
