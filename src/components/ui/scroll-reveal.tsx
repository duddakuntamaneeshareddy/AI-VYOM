"use client"

import { useRef } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"

type Direction = "up" | "down" | "left" | "right"

const directionOffsets: Record<Direction, { x?: number; y?: number }> = {
  up: { y: 24 },
  down: { y: -24 },
  left: { x: 24 },
  right: { x: -24 },
}

interface ScrollRevealProps {
  children: React.ReactNode
  direction?: Direction
  delay?: number
  duration?: number
  className?: string
  once?: boolean
}

export function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  duration = 0.4,
  className,
  once = true,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const shouldReduceMotion = useReducedMotion()
  const offset = directionOffsets[direction]

  return (
    <motion.div
      ref={ref}
      initial={
        shouldReduceMotion
          ? { opacity: 1, x: 0, y: 0 }
          : { opacity: 0, ...offset }
      }
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, margin: "-60px" }}
      transition={{
        duration,
        delay,
        ease: "easeOut",
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  )
}
