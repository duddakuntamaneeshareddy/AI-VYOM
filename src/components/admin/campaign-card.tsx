"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Send, Eye } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { Campaign } from "@/lib/db/types"

interface CampaignCardProps {
  campaign: Campaign
  onSendClick: (campaign: Campaign) => void
}

const SEGMENT_LABELS: Record<Campaign["target_segment"], string> = {
  all: "All customers",
  cart_abandoners: "Cart abandoners",
  recent_buyers: "Recent buyers",
}

export function CampaignCard({ campaign, onSendClick }: CampaignCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <Card className="surface-bento h-full transition-shadow hover:shadow-md">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="line-clamp-1">{campaign.name}</CardTitle>
            <Badge
              variant={campaign.status === "sent" ? "default" : "secondary"}
              className="shrink-0"
            >
              {campaign.status}
            </Badge>
          </div>
          <Badge variant="outline" className="w-fit">
            {SEGMENT_LABELS[campaign.target_segment]}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-1 text-sm text-muted-foreground">
          <p>
            Sent count: <span className="font-medium text-foreground">{campaign.sent_count}</span>
          </p>
          <p>
            Created: {new Date(campaign.created_at).toLocaleDateString()}
          </p>
          {campaign.sent_at && (
            <p>
              Sent: {new Date(campaign.sent_at).toLocaleString()}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex gap-2">
          {campaign.status === "draft" && (
            <Button
              size="sm"
              className="rounded-full"
              onClick={() => onSendClick(campaign)}
            >
              <Send className="mr-1.5 size-3.5" />
              Send
            </Button>
          )}
          <Link
            href={`/admin/campaigns/${campaign.id}`}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "rounded-full"
            )}
          >
            <Eye className="mr-1.5 size-3.5" />
            View
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
