"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react"

import { CountUp } from "./count-up"
import { cn } from "@/lib/utils"

type StatColor = "primary" | "cyan" | "violet" | "amber" | "emerald" | "rose"

interface StatCardProps {
  title: string
  value: number
  icon: LucideIcon
  color?: StatColor
  trend?: {
    value: string
    direction: "up" | "down" | "neutral"
  }
  index?: number
  format?: (value: number) => string
  sparklineData?: number[]
}

const colorStyles: Record<StatColor, string> = {
  primary: "bg-primary/10 text-primary",
  cyan: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
}

function Sparkline({ data, color }: { data: number[]; color: StatColor }) {
  const gradientId = React.useId()
  const width = 120
  const height = 36
  const padding = 4

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const points = data.map((value, i) => {
    const x = padding + (i / (data.length - 1 || 1)) * (width - padding * 2)
    const y = height - padding - ((value - min) / range) * (height - padding * 2)
    return `${x},${y}`
  })

  const areaPath = `M ${points[0]} ${points
    .slice(1)
    .map((p) => `L ${p}`)
    .join(" ")} L ${width - padding},${height - padding} L ${padding},${height - padding} Z`

  const strokeColor =
    color === "primary"
      ? "var(--primary)"
      : color === "cyan"
      ? "#0891b2"
      : color === "violet"
      ? "#7c3aed"
      : color === "amber"
      ? "#d97706"
      : color === "emerald"
      ? "#059669"
      : "#e11d48"

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mt-4 h-9 w-full overflow-visible"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.25" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={areaPath}
        fill={`url(#${gradientId})`}
        className="transition-all duration-500"
      />
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points.join(" ")}
        className="transition-all duration-500"
      />
    </svg>
  )
}

export function StatCard({
  title,
  value,
  icon: Icon,
  color = "primary",
  trend,
  index = 0,
  format,
  sparklineData,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: "easeOut" }}
      whileHover={{ y: -4, transition: { duration: 0.15 } }}
      className="surface-bento group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="mt-1 text-3xl font-bold tracking-tight">
            {format ? format(value) : <CountUp value={value} />}
          </h3>
          {trend && (
            <div className="mt-2 flex items-center gap-1 text-xs">
              {trend.direction === "up" ? (
                <TrendingUp className="size-3 text-emerald-600 dark:text-emerald-400" />
              ) : trend.direction === "down" ? (
                <TrendingDown className="size-3 text-rose-600 dark:text-rose-400" />
              ) : null}
              <span
                className={cn(
                  "font-medium",
                  trend.direction === "up" && "text-emerald-600 dark:text-emerald-400",
                  trend.direction === "down" && "text-rose-600 dark:text-rose-400",
                  trend.direction === "neutral" && "text-muted-foreground"
                )}
              >
                {trend.value}
              </span>
            </div>
          )}
        </div>
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors",
            colorStyles[color]
          )}
        >
          <Icon className="size-5" />
        </div>
      </div>
      {sparklineData && sparklineData.length > 1 && (
        <Sparkline data={sparklineData} color={color} />
      )}
    </motion.div>
  )
}
