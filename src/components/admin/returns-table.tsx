"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Check, X, Loader2, ArrowRight } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ReturnStatusBadge } from "./status-badge"
import { cn } from "@/lib/utils"
import type { Return, Order, Profile } from "@/lib/db/types"

interface ReturnsTableProps {
  returns: (Return & { order: Order; user: Profile })[]
}

const statusOptions = ["all", "pending", "reviewed", "approved", "declined", "processed"] as const

type StatusFilter = (typeof statusOptions)[number]

export function ReturnsTable({ returns }: ReturnsTableProps) {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all")
  const [updatingId, setUpdatingId] = React.useState<string | null>(null)

  const filtered = React.useMemo(() => {
    if (statusFilter === "all") return returns
    return returns.filter((r) => r.status === statusFilter)
  }, [returns, statusFilter])

  async function updateStatus(returnId: string, status: Return["status"]) {
    setUpdatingId(returnId)
    try {
      const res = await fetch(`/api/returns/${returnId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error ?? "Failed to update return")
      }
      toast.success(`Return ${status}`)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed")
    } finally {
      setUpdatingId(null)
    }
  }

  function aiSummary(returnRecord: Return) {
    const analysis = returnRecord.ai_analysis
    if (!analysis || typeof analysis !== "object") return "—"
    const summary = (analysis as { summary?: string }).summary
    return summary ? summary.slice(0, 60) + (summary.length > 60 ? "…" : "") : "—"
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Select
          value={statusFilter}
          onValueChange={(value) => value && setStatusFilter(value as StatusFilter)}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((status) => (
              <SelectItem key={status} value={status}>
                <span className="capitalize">{status}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left">
              <th className="px-4 py-3 font-medium">Return ID</th>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Reason</th>
              <th className="px-4 py-3 font-medium">AI Summary</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <AnimatePresence>
              {filtered.map((returnRecord, index) => (
                <motion.tr
                  key={returnRecord.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ delay: index * 0.03, duration: 0.2 }}
                  className={cn(
                    "transition-colors hover:bg-muted/40",
                    updatingId === returnRecord.id && "bg-primary/5"
                  )}
                >
                  <td className="px-4 py-3 font-medium">
                    <Link
                      href={`/admin/returns/${returnRecord.id}`}
                      className="hover:text-primary hover:underline"
                    >
                      #{returnRecord.id.slice(0, 8)}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    #{returnRecord.order_id.slice(0, 8)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {returnRecord.user.email}
                  </td>
              <td className="max-w-xs px-4 py-3 text-muted-foreground">
                <span className="truncate">{returnRecord.reason}</span>
              </td>
              <td className="max-w-xs px-4 py-3 text-xs text-muted-foreground">
                <span className="truncate">{aiSummary(returnRecord)}</span>
              </td>
                  <td className="px-4 py-3">
                    <ReturnStatusBadge status={returnRecord.status} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(returnRecord.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {returnRecord.status === "pending" && (
                        <>
                          <Button
                            size="xs"
                            variant="outline"
                            className="text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700 dark:text-emerald-400"
                            onClick={() => updateStatus(returnRecord.id, "approved")}
                            disabled={updatingId === returnRecord.id}
                          >
                            {updatingId === returnRecord.id ? (
                              <Loader2 className="mr-1 size-3 animate-spin" />
                            ) : (
                              <Check className="mr-1 size-3" />
                            )}
                            Approve
                          </Button>
                          <Button
                            size="xs"
                            variant="outline"
                            className="text-rose-600 hover:bg-rose-500/10 hover:text-rose-700 dark:text-rose-400"
                            onClick={() => updateStatus(returnRecord.id, "declined")}
                            disabled={updatingId === returnRecord.id}
                          >
                            <X className="mr-1 size-3" />
                            Decline
                          </Button>
                        </>
                      )}
                      <Link href={`/admin/returns/${returnRecord.id}`}>
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
                <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                  No returns found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
