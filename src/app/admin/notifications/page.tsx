import { redirect } from "next/navigation"

import { requireAdmin } from "@/lib/auth/supabase-auth"
import { getAllNotifications, getAbandonedCarts } from "@/lib/db/queries"
import { NotificationsList } from "@/components/admin/notifications-list"

export default async function NotificationsAdminPage() {
  try {
    await requireAdmin()
  } catch {
    redirect("/login")
  }

  const [notifications, abandonedCarts] = await Promise.all([
    getAllNotifications(),
    getAbandonedCarts(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground">
          View sent notifications and trigger customer communications.
        </p>
      </div>
      <NotificationsList
        notifications={notifications}
        abandonedCartUserIds={abandonedCarts.map((cart) => cart.user_id)}
      />
    </div>
  )
}
