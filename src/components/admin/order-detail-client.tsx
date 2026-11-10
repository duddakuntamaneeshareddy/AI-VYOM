"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Truck, Package, CheckCircle, XCircle, Clock } from "lucide-react"
import { toast } from "sonner"

import { buttonVariants } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { OrderStatusBadge } from "./status-badge"
import { cn, formatPrice } from "@/lib/utils"
import type { Order, OrderItem, Product, Profile } from "@/lib/db/types"

interface OrderDetailClientProps {
  order: Order
  items: (OrderItem & { product: Product })[]
  user: Profile
}

const statusOrder = ["pending", "confirmed", "shipped", "delivered"] as const

export function OrderDetailClient({ order, items, user }: OrderDetailClientProps) {
  const router = useRouter()
  const [status, setStatus] = React.useState(order.status)
  const [updating, setUpdating] = React.useState(false)

  async function updateStatus(newStatus: typeof status) {
    if (newStatus === status) return
    setUpdating(true)
    try {
      const res = await fetch(`/api/orders/${order.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error ?? "Failed to update status")
      }
      toast.success(`Order status updated to ${newStatus}`)
      setStatus(newStatus)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed")
    } finally {
      setUpdating(false)
    }
  }

  const activeIndex = statusOrder.indexOf(status as typeof statusOrder[number])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Order #{order.id.slice(0, 8)}
            </h1>
            <p className="text-sm text-muted-foreground">
              Placed on {new Date(order.created_at).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <OrderStatusBadge status={status} />
          <Select
            value={status}
            onValueChange={(value) => value && updateStatus(value as typeof status)}
            disabled={updating}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Update status" />
            </SelectTrigger>
            <SelectContent>
              {["pending", "confirmed", "shipped", "delivered", "cancelled"].map((s) => (
                <SelectItem key={s} value={s}>
                  <span className="capitalize">{s}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="surface-bento lg:col-span-2"
        >
          <h2 className="font-heading text-lg font-semibold">Order Items</h2>
          <div className="mt-4 divide-y rounded-xl border">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 transition-colors hover:bg-muted/30"
              >
                <div>
                  <p className="font-medium">{item.product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(item.price_at_purchase)} × {item.quantity}
                  </p>
                </div>
                <p className="font-semibold">
                  {formatPrice(item.price_at_purchase * item.quantity)}
                </p>
              </div>
            ))}
            {items.length === 0 && (
              <p className="p-4 text-sm text-muted-foreground">No items found</p>
            )}
          </div>
          <div className="mt-4 flex justify-end">
            <p className="text-lg font-bold">Total: {formatPrice(order.total)}</p>
          </div>
        </motion.div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="surface-bento"
          >
            <h2 className="font-heading text-lg font-semibold">Customer</h2>
            <div className="mt-3 space-y-1 text-sm">
              <p>
                <span className="text-muted-foreground">Name:</span>{" "}
                {user.full_name ?? "—"}
              </p>
              <p>
                <span className="text-muted-foreground">Email:</span> {user.email}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.15 }}
            className="surface-bento"
          >
            <h2 className="font-heading text-lg font-semibold">Shipping Address</h2>
            <div className="mt-3 space-y-1 text-sm text-muted-foreground">
              {order.shipping_address ? (
                Object.entries(order.shipping_address).map(([key, value]) => (
                  <p key={key}>
                    <span className="capitalize text-foreground">{key}:</span>{" "}
                    {String(value)}
                  </p>
                ))
              ) : (
                <p>No shipping address provided</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.2 }}
        className="surface-bento"
      >
        <h2 className="font-heading text-lg font-semibold">Status Timeline</h2>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {statusOrder.map((step, index) => {
            const isActive = index <= activeIndex
            const isCurrent = step === status
            const Icon =
              step === "pending"
                ? Clock
                : step === "confirmed"
                  ? Package
                  : step === "shipped"
                    ? Truck
                    : CheckCircle

            return (
              <React.Fragment key={step}>
                <div
                  className={cn(
                    "flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                    isActive
                      ? "border-primary/20 bg-primary/10 text-primary"
                      : "border-border bg-muted text-muted-foreground",
                    isCurrent && "ring-2 ring-primary/30"
                  )}
                >
                  <Icon className="size-4" />
                  <span className="capitalize">{step}</span>
                </div>
                {index < statusOrder.length - 1 && (
                  <div
                    className={cn(
                      "hidden h-px w-6 sm:block",
                      index < activeIndex ? "bg-primary" : "bg-border"
                    )}
                  />
                )}
              </React.Fragment>
            )
          })}
          {status === "cancelled" && (
            <div className="flex items-center gap-2 rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 text-sm font-medium text-rose-600 dark:text-rose-400">
              <XCircle className="size-4" />
              Cancelled
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
