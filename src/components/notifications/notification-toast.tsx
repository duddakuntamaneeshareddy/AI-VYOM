"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  Bell,
  ShoppingBag,
  Truck,
  Megaphone,
  MessageCircle,
} from "lucide-react"

import type { Notification } from "@/lib/db/types"

const POLL_INTERVAL_MS = 30_000

function getNotificationMeta(type: Notification["type"]) {
  switch (type) {
    case "cart_abandonment":
      return {
        icon: ShoppingBag,
        title: "Cart reminder",
        className: "border-primary/30 bg-primary/5",
      }
    case "delivery":
      return {
        icon: Truck,
        title: "Order update",
        className: "border-cyan-500/30 bg-cyan-500/5",
      }
    case "campaign":
      return {
        icon: Megaphone,
        title: "New offer",
        className: "border-violet-500/30 bg-violet-500/5",
      }
    case "engagement":
    default:
      return {
        icon: MessageCircle,
        title: "Notification",
        className: "border-muted-foreground/30 bg-muted/40",
      }
  }
}

export function NotificationToast() {
  const seenIdsRef = React.useRef<Set<string>>(new Set())
  const isFirstLoadRef = React.useRef(true)

  React.useEffect(() => {
    async function fetchAndNotify() {
      try {
        const response = await fetch("/api/notifications")
        if (!response.ok) return

        const data = (await response.json()) as { notifications?: Notification[] }
        const notifications = data.notifications ?? []

        if (isFirstLoadRef.current) {
          notifications.forEach((n) => seenIdsRef.current.add(n.id))
          isFirstLoadRef.current = false
          return
        }

        const newNotifications = notifications.filter(
          (n) => !seenIdsRef.current.has(n.id)
        )

        // Show newest first.
        ;[...newNotifications].reverse().forEach((notification) => {
          seenIdsRef.current.add(notification.id)

          const content = notification.content as Record<string, unknown>
          const message =
            typeof content?.message === "string"
              ? content.message
              : `${notification.type.replace("_", " ")} notification`

          const meta = getNotificationMeta(notification.type)
          const Icon = meta.icon

          toast(message, {
            icon: <Icon className="size-4" />,
            description: meta.title,
            className: meta.className,
            duration: 6000,
          })
        })
      } catch (error) {
        console.error("Notification toast polling error:", error)
      }
    }

    fetchAndNotify()

    const interval = setInterval(fetchAndNotify, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [])

  return null
}
