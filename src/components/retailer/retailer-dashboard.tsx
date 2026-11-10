"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Package, ShoppingCart, AlertTriangle, DollarSign, Plus, ArrowRight } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { ScrollReveal } from "@/components/ui/scroll-reveal"
import { StatCard } from "@/components/admin/stat-card"
import { OrderStatusBadge } from "@/components/admin/status-badge"
import { cn, formatPrice } from "@/lib/utils"
import type { Order } from "@/lib/db/types"

interface RetailerDashboardProps {
  totalProducts: number
  totalOrders: number
  lowStockCount: number
  revenue: number
  recentOrders: {
    order: Order
    customer: { full_name: string | null; email: string }
    items: { product_name: string; quantity: number }[]
    total: number
  }[]
}

function generateSparkline(baseValue: number, points = 7): number[] {
  return Array.from({ length: points }, (_, i) => {
    const noise = Math.sin(i * 1.2) * 0.15 + (i / points) * 0.2
    return Math.max(0, baseValue * (0.7 + noise))
  })
}

export function RetailerDashboard({
  totalProducts,
  totalOrders,
  lowStockCount,
  revenue,
  recentOrders,
}: RetailerDashboardProps) {
  return (
    <div className="relative space-y-8">
      <div className="pointer-events-none absolute -inset-6 -z-10 overflow-hidden">
        <div className="absolute -top-20 right-0 h-80 w-80 rounded-full bg-violet-500/5 blur-3xl" />
        <div className="absolute bottom-0 -left-20 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <ScrollReveal direction="up">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Retailer Dashboard</h1>
            <p className="text-muted-foreground">Overview of your products, orders, and stock.</p>
          </div>
          <Link
            href="/retailer/products/new"
            className={cn(buttonVariants({}), "rounded-full")}
          >
            <Plus className="mr-2 size-4" />
            Add Product
          </Link>
        </motion.div>
      </ScrollReveal>

      <ScrollReveal direction="up" delay={0.1}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Products"
            value={totalProducts}
            icon={Package}
            color="violet"
            index={0}
            sparklineData={generateSparkline(totalProducts)}
          />
          <StatCard
            title="Total Orders"
            value={totalOrders}
            icon={ShoppingCart}
            color="primary"
            index={1}
            sparklineData={generateSparkline(totalOrders)}
          />
          <StatCard
            title="Low Stock Alerts"
            value={lowStockCount}
            icon={AlertTriangle}
            color="amber"
            index={2}
            sparklineData={generateSparkline(lowStockCount)}
          />
          <StatCard
            title="Revenue"
            value={revenue}
            icon={DollarSign}
            color="emerald"
            index={3}
            format={(v) => `$${Math.round(v).toLocaleString("en-US")}`}
            sparklineData={generateSparkline(revenue)}
          />
        </div>
      </ScrollReveal>

      <ScrollReveal direction="up" delay={0.15}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="surface-bento"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-heading text-lg font-semibold">Recent Orders</h2>
              <p className="text-sm text-muted-foreground">Customers who bought your products</p>
            </div>
            <Link
              href="/retailer/orders"
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
                    <th className="pb-2 font-medium">Customer</th>
                    <th className="pb-2 font-medium">Items</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {recentOrders.map(({ order, customer, items, total }, index) => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.05 }}
                    >
                      <td className="py-3 font-medium">#{order.id.slice(0, 8)}</td>
                      <td className="py-3">
                        <div>
                          <p className="font-medium">{customer.full_name ?? "—"}</p>
                          <p className="text-xs text-muted-foreground">{customer.email}</p>
                        </div>
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {items.map((i) => `${i.product_name} ×${i.quantity}`).join(", ")}
                      </td>
                      <td className="py-3">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="py-3 text-right font-medium">{formatPrice(total)}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </ScrollReveal>
    </div>
  )
}
