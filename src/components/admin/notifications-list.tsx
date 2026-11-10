"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  ShoppingBag,
  Truck,
  Bell,
  Megaphone,
  Send,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { StatCard } from "./stat-card"
import { cn } from "@/lib/utils"
import type { Notification } from "@/lib/db/types"

interface NotificationsListProps {
  notifications: (Notification & { user_email: string | null; user_name: string | null })[]
  abandonedCartUserIds: string[]
}

const typeOptions = ["all", "cart_abandonment", "delivery", "engagement", "campaign"] as const
const channelOptions = ["all", "email", "in_app"] as const

function getNotificationIcon(type: Notification["type"]) {
  switch (type) {
    case "cart_abandonment":
      return <ShoppingBag className="size-4 text-primary" />
    case "delivery":
      return <Truck className="size-4 text-cyan-500" />
    case "campaign":
      return <Megaphone className="size-4 text-violet-500" />
    case "engagement":
    default:
      return <Bell className="size-4 text-muted-foreground" />
  }
}

export function NotificationsList({
  notifications,
  abandonedCartUserIds,
}: NotificationsListProps) {
  const router = useRouter()
  const [typeFilter, setTypeFilter] = React.useState<(typeof typeOptions)[number]>("all")
  const [channelFilter, setChannelFilter] = React.useState<(typeof channelOptions)[number]>("all")
  const [sending, setSending] = React.useState(false)

  const filtered = React.useMemo(() => {
    return notifications.filter((n) => {
      const matchesType = typeFilter === "all" || n.type === typeFilter
      const matchesChannel = channelFilter === "all" || n.channel === channelFilter
      return matchesType && matchesChannel
    })
  }, [notifications, typeFilter, channelFilter])

  const totalSent = notifications.filter((n) => n.status === "sent").length
  const totalFailed = notifications.filter((n) => n.status === "failed").length
  const successRate =
    totalSent + totalFailed === 0
      ? 0
      : Math.round((totalSent / (totalSent + totalFailed)) * 100)

  async function handleSendCartAbandonment() {
    if (abandonedCartUserIds.length === 0) {
      toast.info("No abandoned carts to notify")
      return
    }

    setSending(true)
    let sent = 0
    let failed = 0

    try {
      for (const userId of abandonedCartUserIds) {
        const res = await fetch("/api/notifications/cart-abandonment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        })
        if (res.ok) {
          sent++
        } else {
          failed++
        }
      }

      if (failed === 0) {
        toast.success(`Cart abandonment emails sent to ${sent} users`)
      } else {
        toast.success(`Sent ${sent} emails, ${failed} failed`)
      }
      router.refresh()
    } catch (error) {
      toast.error("Failed to send cart abandonment notifications")
      console.error(error)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Sent" value={totalSent} icon={CheckCircle} color="emerald" index={0} />
        <StatCard title="Failed" value={totalFailed} icon={XCircle} color="rose" index={1} />
        <StatCard
          title="Success Rate"
          value={successRate}
          icon={CheckCircle}
          color="cyan"
          index={2}
          format={(v) => `${v}%`}
        />
        <StatCard
          title="Total Notifications"
          value={notifications.length}
          icon={Bell}
          color="primary"
          index={3}
        />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Select value={typeFilter} onValueChange={(value) =>         setTypeFilter(value as (typeof typeOptions)[number])}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              {typeOptions.map((type) => (
                <SelectItem key={type} value={type}>
                  <span className="capitalize">{type.replace("_", " ")}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={channelFilter} onValueChange={(value) => setChannelFilter(value as (typeof channelOptions)[number])}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Filter by channel" />
            </SelectTrigger>
            <SelectContent>
              {channelOptions.map((channel) => (
                <SelectItem key={channel} value={channel}>
                  <span className="capitalize">{channel.replace("_", " ")}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleSendCartAbandonment} disabled={sending}>
          {sending ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Send className="mr-2 size-4" />
          )}
          Trigger Cart Abandonment
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left">
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Channel</th>
              <th className="px-4 py-3 font-medium">Recipient</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <AnimatePresence>
              {filtered.map((notification, index) => (
                <motion.tr
                  key={notification.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ delay: index * 0.03, duration: 0.2 }}
                  className="transition-colors hover:bg-muted/40"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {getNotificationIcon(notification.type)}
                      <span className="capitalize">{notification.type.replace("_", " ")}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground capitalize">
                    {notification.channel.replace("_", " ")}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {notification.user_email ?? "Unknown"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className={cn(
                        "capitalize",
                        notification.status === "sent" &&
                          "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                        notification.status === "failed" &&
                          "border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400",
                        notification.status === "pending" &&
                          "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      )}
                    >
                      {notification.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {notification.sent_at
                      ? new Date(notification.sent_at).toLocaleString()
                      : new Date(notification.created_at).toLocaleString()}
                  </td>
                  <td className="max-w-xs px-4 py-3 text-xs text-muted-foreground">
                    <span className="truncate">
                      {(
                        notification.content as { subject?: string; message?: string }
                      ).subject ??
                        (
                          notification.content as { subject?: string; message?: string }
                        ).message ??
                        "—"}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No notifications found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
