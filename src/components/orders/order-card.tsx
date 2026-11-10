"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Order, OrderStatus } from "@/lib/db/types"

const statusStyles: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  shipped: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
}

interface OrderCardProps {
  order: Order
  index: number
}

export function OrderCard({ order, index }: OrderCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link href={`/orders/${order.id}`}>
        <div className="surface-bento group surface-bento-hover">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-heading font-semibold">
                Order #{order.id.slice(0, 8)}
              </p>
              <p className="text-sm text-muted-foreground">
                Placed on {new Date(order.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge
                variant="outline"
                className={`capitalize ${statusStyles[order.status]}`}
              >
                {order.status}
              </Badge>
              <span className="font-bold">${order.total.toFixed(2)}</span>
              <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </div>
          </div>
          {order.status === "delivered" && (
            <div className="mt-4">
              <Link href={`/orders/${order.id}/return`} onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                >
                  Return / Refund
                </Button>
              </Link>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  )
}
