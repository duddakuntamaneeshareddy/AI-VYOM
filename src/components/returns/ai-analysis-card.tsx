"use client"

import { motion } from "framer-motion"
import {
  Loader2,
  RefreshCw,
  ShieldAlert,
  ThumbsDown,
  ThumbsUp,
  HelpCircle,
} from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import type { ReturnAnalysis } from "@/app/api/returns/analyze/route"

interface AIAnalysisCardProps {
  analysis: ReturnAnalysis | null
  isLoading: boolean
}

const resolutionConfig: Record<
  ReturnAnalysis["suggested_resolution"],
  { label: string; icon: typeof ThumbsUp; color: string; bg: string }
> = {
  refund: {
    label: "Refund",
    icon: ThumbsUp,
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-900/20",
  },
  replacement: {
    label: "Replacement",
    icon: RefreshCw,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-900/20",
  },
  decline: {
    label: "Decline",
    icon: ThumbsDown,
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-900/20",
  },
  review_needed: {
    label: "Review Needed",
    icon: ShieldAlert,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-900/20",
  },
}

const confidenceConfig: Record<
  ReturnAnalysis["confidence"],
  { label: string; color: string }
> = {
  high: { label: "High Confidence", color: "text-green-600 dark:text-green-400" },
  medium: { label: "Medium Confidence", color: "text-blue-600 dark:text-blue-400" },
  low: { label: "Low Confidence", color: "text-amber-600 dark:text-amber-400" },
}

export function AIAnalysisCard({ analysis, isLoading }: AIAnalysisCardProps) {
  if (isLoading) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
            <Loader2 className="size-5 animate-spin text-primary" />
          </div>
          <div>
            <h3 className="font-heading font-semibold">AI is analyzing your request...</h3>
            <p className="text-sm text-muted-foreground">
              Reviewing the reason and product details
            </p>
          </div>
        </div>
        <div className="mt-6 space-y-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="glass-card p-6 text-center text-muted-foreground">
        <HelpCircle className="mx-auto size-8 opacity-50" />
        <p className="mt-2 text-sm">
          Complete the previous steps to get an AI analysis.
        </p>
      </div>
    )
  }

  const resolution = resolutionConfig[analysis.suggested_resolution]
  const confidence = confidenceConfig[analysis.confidence]
  const ResolutionIcon = resolution.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="glass-card p-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex size-12 items-center justify-center rounded-xl ${resolution.bg}`}
          >
            <ResolutionIcon className={`size-6 ${resolution.color}`} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Suggested Resolution</p>
            <h3 className={`font-heading text-xl font-bold ${resolution.color}`}>
              {resolution.label}
            </h3>
          </div>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-sm text-muted-foreground">Confidence</p>
          <p className={`font-medium ${confidence.color}`}>{confidence.label}</p>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-sm font-medium text-foreground">Summary</p>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          {analysis.summary}
        </p>
      </div>

      {analysis.follow_up_questions.length > 0 && (
        <div className="mt-6">
          <p className="text-sm font-medium text-foreground">Follow-up Questions</p>
          <ul className="mt-2 space-y-2">
            {analysis.follow_up_questions.map((question, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.08 }}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                {question}
              </motion.li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  )
}
