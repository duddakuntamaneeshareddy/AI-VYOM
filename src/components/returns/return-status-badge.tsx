"use client"

import { Badge } from "@/components/ui/badge"
import type { ReturnStatus } from "@/lib/db/types"

const statusStyles: Record<ReturnStatus, string> = {
  pending:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  reviewed:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  approved:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  declined: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  processed: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
}

interface ReturnStatusBadgeProps {
  status: ReturnStatus
  className?: string
}

export function ReturnStatusBadge({ status, className }: ReturnStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={`w-fit capitalize ${statusStyles[status]} ${className ?? ""}`}
    >
      {status}
    </Badge>
  )
}
