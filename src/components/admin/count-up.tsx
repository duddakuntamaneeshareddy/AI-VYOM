"use client"

import * as React from "react"
import { animate } from "framer-motion"

interface CountUpProps {
  value: number
  duration?: number
  decimals?: number
  className?: string
}

export function CountUp({ value, duration = 1.2, decimals = 0, className }: CountUpProps) {
  const [display, setDisplay] = React.useState(0)
  const previousValue = React.useRef(0)

  React.useEffect(() => {
    const start = previousValue.current
    const controls = animate(start, value, {
      duration,
      ease: "easeOut",
      onUpdate: (latest) => {
        setDisplay(Number(latest.toFixed(decimals)))
      },
    })

    previousValue.current = value

    return () => {
      controls.stop()
    }
  }, [value, duration, decimals])

  return <span className={className}>{display.toLocaleString("en-US")}</span>
}
