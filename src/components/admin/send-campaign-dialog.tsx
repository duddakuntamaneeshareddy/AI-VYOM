"use client"

import * as React from "react"
import { Loader2, Send, CheckCircle2, AlertCircle } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Campaign } from "@/lib/db/types"

interface SendResult {
  success: boolean
  sentCount: number
  failedCount: number
  error?: string
}

interface SendCampaignDialogProps {
  campaign: Campaign | null
  recipientCount: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onSend: () => Promise<SendResult>
}

const SEGMENT_LABELS: Record<Campaign["target_segment"], string> = {
  all: "All customers",
  cart_abandoners: "Cart abandoners",
  recent_buyers: "Recent buyers",
}

export function SendCampaignDialog({
  campaign,
  recipientCount,
  open,
  onOpenChange,
  onSend,
}: SendCampaignDialogProps) {
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle")
  const [result, setResult] = React.useState<SendResult | null>(null)

  React.useEffect(() => {
    if (open) {
      setStatus("idle")
      setResult(null)
    }
  }, [open])

  async function handleConfirm() {
    setStatus("loading")
    try {
      const sendResult = await onSend()
      setResult(sendResult)
      setStatus(sendResult.success ? "success" : "error")
    } catch (err) {
      setResult({
        success: false,
        sentCount: 0,
        failedCount: 0,
        error: err instanceof Error ? err.message : "Something went wrong",
      })
      setStatus("error")
    }
  }

  function handleClose() {
    onOpenChange(false)
  }

  if (!campaign) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send campaign</DialogTitle>
          <DialogDescription>
            Review the campaign details before sending emails to the target segment.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Campaign</p>
            <p className="font-heading font-medium">{campaign.name}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{SEGMENT_LABELS[campaign.target_segment]}</Badge>
            <Badge variant="secondary">{recipientCount} recipients</Badge>
          </div>

          {status === "success" && result && (
            <div className="flex items-start gap-3 rounded-lg bg-emerald-500/10 p-3 text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
              <div className="text-sm">
                <p className="font-medium">Campaign sent successfully</p>
                <p>Sent to {result.sentCount} recipient{result.sentCount === 1 ? "" : "s"}.</p>
                {result.failedCount > 0 && (
                  <p className="mt-1">{result.failedCount} failed.</p>
                )}
              </div>
            </div>
          )}

          {status === "error" && result && (
            <div className="flex items-start gap-3 rounded-lg bg-destructive/10 p-3 text-destructive">
              <AlertCircle className="mt-0.5 size-5 shrink-0" />
              <div className="text-sm">
                <p className="font-medium">Campaign send failed</p>
                <p>{result.error || "Could not send campaign."}</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {status === "idle" || status === "loading" ? (
            <>
              <Button variant="outline" onClick={handleClose} disabled={status === "loading"}>
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={status === "loading" || recipientCount === 0}
                className="rounded-full"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 size-4" />
                    Send to {recipientCount} recipient{recipientCount === 1 ? "" : "s"}
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button onClick={handleClose} variant="outline" className="w-full sm:w-auto">
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
