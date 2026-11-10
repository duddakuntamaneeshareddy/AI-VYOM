"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Check, X, Package, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button, buttonVariants } from "@/components/ui/button"
import { ReturnStatusBadge } from "./status-badge"
import { cn, formatPrice } from "@/lib/utils"
import type { Return, Order, OrderItem, Product, Profile } from "@/lib/db/types"

interface ReturnDetailClientProps {
  returnRecord: Return
  order: Order
  orderItem: OrderItem & { product: Product }
  user: Profile
}

export function ReturnDetailClient({
  returnRecord,
  order,
  orderItem,
  user,
}: ReturnDetailClientProps) {
  const router = useRouter()
  const [status, setStatus] = React.useState(returnRecord.status)
  const [updating, setUpdating] = React.useState(false)

  async function updateStatus(newStatus: Return["status"]) {
    if (newStatus === status) return
    setUpdating(true)
    try {
      const res = await fetch(`/api/returns/${returnRecord.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error ?? "Failed to update return")
      }
      toast.success(`Return marked as ${newStatus}`)
      setStatus(newStatus)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed")
    } finally {
      setUpdating(false)
    }
  }

  const aiSummary =
    returnRecord.ai_analysis && typeof returnRecord.ai_analysis === "object"
      ? (returnRecord.ai_analysis as { summary?: string }).summary
      : undefined

  const aiDetails =
    returnRecord.ai_analysis && typeof returnRecord.ai_analysis === "object"
      ? (returnRecord.ai_analysis as Record<string, unknown>)
      : null

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/returns"
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Return #{returnRecord.id.slice(0, 8)}
            </h1>
            <p className="text-sm text-muted-foreground">
              Submitted on {new Date(returnRecord.created_at).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ReturnStatusBadge status={status} />
          {status === "pending" && (
            <>
              <Button
                variant="outline"
                className="text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700 dark:text-emerald-400"
                onClick={() => updateStatus("approved")}
                disabled={updating}
              >
                {updating ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Check className="mr-2 size-4" />
                )}
                Approve
              </Button>
              <Button
                variant="outline"
                className="text-rose-600 hover:bg-rose-500/10 hover:text-rose-700 dark:text-rose-400"
                onClick={() => updateStatus("declined")}
                disabled={updating}
              >
                <X className="mr-2 size-4" />
                Decline
              </Button>
            </>
          )}
          {status === "approved" && (
            <Button
              variant="outline"
              onClick={() => updateStatus("processed")}
              disabled={updating}
            >
              {updating ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Package className="mr-2 size-4" />
              )}
              Mark Processed
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="surface-bento lg:col-span-2"
        >
          <h2 className="font-heading text-lg font-semibold">AI Analysis</h2>
          {aiSummary ? (
            <div className="mt-3 rounded-xl border bg-muted/30 p-4">
              <p className="text-sm leading-relaxed">{aiSummary}</p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">No AI summary available</p>
          )}
          {aiDetails && (
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {Object.entries(aiDetails)
                .filter(([key]) => key !== "summary")
                .map(([key, value]) => (
                  <div
                    key={key}
                    className="rounded-lg border p-3 text-sm transition-colors hover:bg-muted/30"
                  >
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {key.replace(/_/g, " ")}
                    </p>
                    <p className="mt-1 font-medium">
                      {typeof value === "string" ? value : JSON.stringify(value)}
                    </p>
                  </div>
                ))}
            </div>
          )}
        </motion.div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="surface-bento"
          >
            <h2 className="font-heading text-lg font-semibold">Return Info</h2>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <ReturnStatusBadge status={status} />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reason</span>
                <span className="max-w-[60%] text-right">{returnRecord.reason}</span>
              </div>
              {returnRecord.resolved_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Resolved</span>
                  <span>{new Date(returnRecord.resolved_at).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.15 }}
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
            transition={{ duration: 0.35, delay: 0.2 }}
            className="surface-bento"
          >
            <h2 className="font-heading text-lg font-semibold">Order Item</h2>
            <div className="mt-3 space-y-1 text-sm">
              <p>
                <span className="text-muted-foreground">Product:</span>{" "}
                {orderItem.product.name}
              </p>
              <p>
                <span className="text-muted-foreground">Price:</span>{" "}
                {formatPrice(orderItem.price_at_purchase)}
              </p>
              <p>
                <span className="text-muted-foreground">Quantity:</span> {orderItem.quantity}
              </p>
              <p>
                <span className="text-muted-foreground">Order total:</span>{" "}
                {formatPrice(order.total)}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
