"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { OrderStatus, ReturnStatus } from "@/lib/db/types"

interface StatusBadgeProps {
  status: OrderStatus | ReturnStatus
  className?: string
}

const orderStatusStyles: Record<OrderStatus, string> = {
  pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  confirmed: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  shipped: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  delivered: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  cancelled: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
}

const returnStatusStyles: Record<ReturnStatus, string> = {
  pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  reviewed: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  approved: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  declined: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  processed: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
}

function AnimatedBadge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.span
      key={String(children)}
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
    >
      <Badge variant="outline" className={className}>
        {children}
      </Badge>
    </motion.span>
  )
}

export function OrderStatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  return (
    <AnimatedBadge className={cn("capitalize", orderStatusStyles[status], className)}>
      {status}
    </AnimatedBadge>
  )
}

export function ReturnStatusBadge({ status, className }: { status: ReturnStatus; className?: string }) {
  return (
    <AnimatedBadge className={cn("capitalize", returnStatusStyles[status], className)}>
      {status}
    </AnimatedBadge>
  )
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  if (["pending", "confirmed", "shipped", "delivered", "cancelled"].includes(status as OrderStatus)) {
    return <OrderStatusBadge status={status as OrderStatus} className={className} />
  }
  return <ReturnStatusBadge status={status as ReturnStatus} className={className} />
}
