"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  ShoppingCart,
  DollarSign,
  Package,
  Users,
  ShoppingBag,
  RotateCcw,
  Megaphone,
  Send,
  Eye,
  Plus,
  ArrowRight,
} from "lucide-react"
import { toast } from "sonner"

import { Button, buttonVariants } from "@/components/ui/button"
import { MagneticButton } from "@/components/ui/magnetic-button"
import { ScrollReveal } from "@/components/ui/scroll-reveal"
import { StatCard } from "./stat-card"
import { RevenueChart } from "./revenue-chart"
import { OrderStatusBadge } from "./status-badge"
import { cn, formatPrice } from "@/lib/utils"
import type { AdminStats } from "@/lib/db/queries"
import type { Order } from "@/lib/db/types"

interface AdminDashboardProps {
  stats: AdminStats
  recentOrders: Order[]
  revenue: { date: string; revenue: number }[]
  abandonedCartUserIds: string[]
}

function generateSparkline(baseValue: number, points = 7): number[] {
  return Array.from({ length: points }, (_, i) => {
    const noise = Math.sin(i * 1.2) * 0.15 + (i / points) * 0.2
    return Math.max(0, baseValue * (0.7 + noise))
  })
}

export function AdminDashboard({
  stats,
  recentOrders,
  revenue,
  abandonedCartUserIds,
}: AdminDashboardProps) {
  const router = useRouter()
  const [sendingAbandonment, setSendingAbandonment] = React.useState(false)

  async function handleSendCartAbandonment() {
    if (abandonedCartUserIds.length === 0) {
      toast.info("No abandoned carts to notify")
      return
    }

    setSendingAbandonment(true)
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
      setSendingAbandonment(false)
    }
  }

  const revenueValues = revenue.map((r) => r.revenue)

  return (
    <div className="relative space-y-8">
      {/* Gradient mesh background */}
      <div className="pointer-events-none absolute -inset-6 -z-10 overflow-hidden">
        <div className="absolute -top-20 right-0 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 -left-20 h-96 w-96 rounded-full bg-violet-500/5 blur-3xl" />
      </div>

      <ScrollReveal direction="up">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Overview of your store performance and recent activity.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={handleSendCartAbandonment}
              disabled={sendingAbandonment}
            >
              <Send className="mr-2 size-4" />
              {sendingAbandonment ? "Sending..." : "Send Cart Abandonment"}
            </Button>
            <MagneticButton strength={0.2}>
              <Link
                href="/admin/campaigns/create"
                className={cn(buttonVariants({}), "rounded-full")}
              >
                <Plus className="mr-2 size-4" />
                Create Campaign
              </Link>
            </MagneticButton>
          </div>
        </motion.div>
      </ScrollReveal>

      {/* Stats grid */}
      <ScrollReveal direction="up" delay={0.1}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            icon={ShoppingCart}
            color="primary"
            index={0}
            sparklineData={generateSparkline(stats.totalOrders)}
          />
          <StatCard
            title="Total Revenue"
            value={stats.totalRevenue}
            icon={DollarSign}
            color="emerald"
            index={1}
            format={(v) => `$${Math.round(v).toLocaleString("en-US")}`}
            sparklineData={revenueValues.length > 1 ? revenueValues : generateSparkline(stats.totalRevenue)}
          />
          <StatCard
            title="Total Products"
            value={stats.totalProducts}
            icon={Package}
            color="violet"
            index={2}
            sparklineData={generateSparkline(stats.totalProducts)}
          />
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
            color="cyan"
            index={3}
            sparklineData={generateSparkline(stats.totalUsers)}
          />
          <StatCard
            title="Abandoned Carts"
            value={stats.abandonedCarts}
            icon={ShoppingBag}
            color="amber"
            index={4}
            sparklineData={generateSparkline(stats.abandonedCarts)}
          />
          <StatCard
            title="Pending Returns"
            value={stats.pendingReturns}
            icon={RotateCcw}
            color="rose"
            index={5}
            sparklineData={generateSparkline(stats.pendingReturns)}
          />
          <StatCard
            title="Active Campaigns"
            value={stats.activeCampaigns}
            icon={Megaphone}
            color="primary"
            index={6}
            sparklineData={generateSparkline(stats.activeCampaigns)}
          />
        </div>
      </ScrollReveal>

      {/* Recent orders + revenue */}
      <div className="grid gap-6 lg:grid-cols-3">
        <ScrollReveal direction="left" delay={0.15} className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            className="surface-bento"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-heading text-lg font-semibold">Recent Orders</h2>
                <p className="text-sm text-muted-foreground">Last 5 orders placed</p>
              </div>
              <Link
                href="/admin/orders"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
              >
                View all
                <ArrowRight className="ml-1 size-4" />
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No orders yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-2 font-medium">Order ID</th>
                      <th className="pb-2 font-medium">Date</th>
                      <th className="pb-2 font-medium">Status</th>
                      <th className="pb-2 font-medium text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {recentOrders.map((order, index) => (
                      <motion.tr
                        key={order.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.05 }}
                      >
                        <td className="py-3 font-medium">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="hover:text-primary hover:underline"
                          >
                            #{order.id.slice(0, 8)}
                          </Link>
                        </td>
                        <td className="py-3 text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3">
                          <OrderStatusBadge status={order.status} />
                        </td>
                        <td className="py-3 text-right font-medium">
                          {formatPrice(order.total)}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </ScrollReveal>

        <ScrollReveal direction="right" delay={0.2}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.4 }}
            className="surface-bento"
          >
            <RevenueChart data={revenue} />
          </motion.div>
        </ScrollReveal>
      </div>

      {/* Quick actions */}
      <ScrollReveal direction="up" delay={0.25}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="surface-bento"
        >
          <h2 className="font-heading text-lg font-semibold">Quick Actions</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <MagneticButton strength={0.2}>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleSendCartAbandonment}
                disabled={sendingAbandonment}
              >
                <Send className="mr-2 size-4 text-primary" />
                Send Cart Abandonment
              </Button>
            </MagneticButton>
            <MagneticButton strength={0.2}>
              <Link
                href="/admin/returns"
                className={cn(buttonVariants({ variant: "outline" }), "w-full justify-start")}
              >
                <Eye className="mr-2 size-4 text-violet-500" />
                View Returns
              </Link>
            </MagneticButton>
            <MagneticButton strength={0.2}>
              <Link
                href="/admin/campaigns/create"
                className={cn(buttonVariants({ variant: "outline" }), "w-full justify-start")}
              >
                <Plus className="mr-2 size-4 text-emerald-500" />
                Create Campaign
              </Link>
            </MagneticButton>
          </div>
        </motion.div>
      </ScrollReveal>
    </div>
  )
}
