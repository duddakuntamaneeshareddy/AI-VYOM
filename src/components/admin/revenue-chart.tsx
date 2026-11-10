"use client"

import * as React from "react"
import { motion } from "framer-motion"

interface RevenueChartProps {
  data: { date: string; revenue: number }[]
}

export function RevenueChart({ data }: RevenueChartProps) {
  const max = Math.max(...data.map((d) => d.revenue), 1)
  const total = data.reduce((sum, d) => sum + d.revenue, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Total revenue (last {data.length} days)</p>
          <p className="text-2xl font-bold">${total.toLocaleString("en-US")}</p>
        </div>
      </div>

      <div className="relative h-48 w-full">
        <svg
          viewBox={`0 0 ${data.length * 48} 200`}
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full overflow-visible"
        >
          {/* Grid lines */}
          {[0, 50, 100, 150].map((y) => (
            <line
              key={y}
              x1={0}
              y1={y}
              x2={data.length * 48}
              y2={y}
              className="stroke-border"
              strokeDasharray="4 4"
            />
          ))}

          {/* Bars */}
          {data.map((point, index) => {
            const barHeight = (point.revenue / max) * 160
            const x = index * 48 + 12
            const y = 180 - barHeight

            return (
              <g key={point.date}>
                <motion.rect
                  initial={{ height: 0, y: 180 }}
                  animate={{ height: barHeight, y }}
                  transition={{ duration: 0.5, delay: index * 0.05, ease: "easeOut" }}
                  x={x}
                  width={24}
                  rx={6}
                  className="fill-primary/80"
                />
                <text
                  x={x + 12}
                  y={y - 8}
                  textAnchor="middle"
                  className="fill-foreground text-[10px] font-medium"
                >
                  {point.revenue > 0 ? `$${Math.round(point.revenue)}` : ""}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      <div className="flex justify-between text-xs text-muted-foreground">
        {data.map((point) => (
          <span key={point.date} className="flex-1 text-center">
            {point.date}
          </span>
        ))}
      </div>
    </div>
  )
}
