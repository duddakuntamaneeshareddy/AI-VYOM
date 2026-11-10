import { Suspense } from "react"
import { redirect } from "next/navigation"

import { requireAdmin } from "@/lib/auth/supabase-auth"
import {
  getAdminStats,
  getRecentOrders,
  getRevenueByDateRange,
  getAbandonedCarts,
} from "@/lib/db/queries"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { StatCardSkeleton } from "@/components/ui/skeleton-card"

async function AdminDashboardData() {
  const [stats, recentOrders, revenue, abandonedCarts] = await Promise.all([
    getAdminStats(),
    getRecentOrders(5),
    getRevenueByDateRange(7),
    getAbandonedCarts(),
  ])

  return (
    <AdminDashboard
      stats={stats}
      recentOrders={recentOrders}
      revenue={revenue}
      abandonedCartUserIds={abandonedCarts.map((cart) => cart.user_id)}
    />
  )
}

function AdminDashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="surface-bento h-80 lg:col-span-2" />
        <div className="surface-bento h-80" />
      </div>
    </div>
  )
}

export default async function AdminPage() {
  try {
    await requireAdmin()
  } catch {
    redirect("/login")
  }

  return (
    <Suspense fallback={<AdminDashboardSkeleton />}>
      <AdminDashboardData />
    </Suspense>
  )
}
