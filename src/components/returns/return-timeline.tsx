"use client"

import { Clock, FileSearch, ThumbsDown, ThumbsUp, Package } from "lucide-react"

import { cn } from "@/lib/utils"
import type { ReturnStatus } from "@/lib/db/types"

interface TimelineStep {
  status: ReturnStatus | "start"
  label: string
  icon: typeof Clock
}

const baseSteps: TimelineStep[] = [
  { status: "pending", label: "Request Received", icon: Clock },
  { status: "reviewed", label: "AI Reviewed", icon: FileSearch },
]

interface ReturnTimelineProps {
  status: ReturnStatus
  className?: string
}

export function ReturnTimeline({ status, className }: ReturnTimelineProps) {
  const isDeclined = status === "declined"

  const steps: TimelineStep[] = isDeclined
    ? [
        ...baseSteps,
        { status: "declined", label: "Declined", icon: ThumbsDown },
      ]
    : [
        ...baseSteps,
        { status: "approved", label: "Approved", icon: ThumbsUp },
        { status: "processed", label: "Processed", icon: Package },
      ]

  const activeIndex = steps.findIndex((step) => step.status === status)

  return (
    <div className={cn("relative", className)}>
      <div className="absolute top-5 left-0 right-0 hidden h-0.5 bg-muted sm:block" />
      <div className="grid gap-6 sm:grid-cols-3">
        {steps.map((step, index) => {
          const Icon = step.icon
          const isActive = index <= activeIndex
          const isCurrent = index === activeIndex

          return (
            <div
              key={step.status}
              className="relative flex items-start gap-3 sm:block sm:text-center"
            >
              <div
                className={cn(
                  "relative z-10 flex size-10 items-center justify-center rounded-full border-2 sm:mx-auto",
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted bg-background text-muted-foreground",
                  isCurrent && "ring-4 ring-primary/20"
                )}
              >
                <Icon className="size-5" />
              </div>
              <div className="sm:mt-3">
                <p
                  className={cn(
                    "text-sm font-semibold",
                    isActive ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
