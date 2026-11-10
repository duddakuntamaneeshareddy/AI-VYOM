"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Search, ArrowRight } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { OrderStatusBadge } from "./status-badge"
import { cn, formatPrice } from "@/lib/utils"
import type { Order, OrderStatus } from "@/lib/db/types"

interface OrdersTableProps {
  orders: (Order & { user_email: string })[]
}

const statusOptions: Array<OrderStatus | "all"> = [
  "all",
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
]

export function OrdersTable({ orders }: OrdersTableProps) {
  const router = useRouter()
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<OrderStatus | "all">("all")
  const [updatingId, setUpdatingId] = React.useState<string | null>(null)

  const filtered = React.useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus = statusFilter === "all" || order.status === statusFilter
      const term = search.toLowerCase()
      const matchesSearch =
        order.id.toLowerCase().includes(term) ||
        order.user_email.toLowerCase().includes(term)
      return matchesStatus && matchesSearch
    })
  }, [orders, search, statusFilter])

  async function updateStatus(orderId: string, newStatus: OrderStatus) {
    setUpdatingId(orderId)
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error ?? "Failed to update status")
      }

      toast.success(`Order status updated to ${newStatus}`)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed")
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by order ID or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value) => value && setStatusFilter(value as OrderStatus | "all")}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((status) => (
              <SelectItem key={status} value={status}>
                <span className="capitalize">{status.replace("_", " ")}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left">
              <th className="px-4 py-3 font-medium">Order ID</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Total</th>
              <th className="px-4 py-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <AnimatePresence>
              {filtered.map((order, index) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ delay: index * 0.03, duration: 0.2 }}
                  className={cn(
                    "group transition-colors hover:bg-muted/40",
                    updatingId === order.id && "bg-primary/5"
                  )}
                >
                  <td className="px-4 py-3 font-medium">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="hover:text-primary hover:underline"
                    >
                      #{order.id.slice(0, 8)}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{order.user_email}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {formatPrice(order.total)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Select
                        value={order.status}
                        onValueChange={(value) => value && updateStatus(order.id, value as OrderStatus)}
                        disabled={updatingId === order.id}
                      >
                        <SelectTrigger className="h-7 w-32 text-xs">
                          <SelectValue placeholder="Update" />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions
                            .filter((s) => s !== "all")
                            .map((status) => (
                              <SelectItem key={status} value={status}>
                                <span className="capitalize">{status}</span>
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <Link href={`/admin/orders/${order.id}`}>
                        <Button variant="ghost" size="icon-xs">
                          <ArrowRight className="size-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
