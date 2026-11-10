"use client"

import { usePathname } from "next/navigation"
import { motion, useReducedMotion } from "framer-motion"

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={
        shouldReduceMotion
          ? undefined
          : { opacity: 0, y: -8, transition: { duration: 0.2 } }
      }
      transition={{
        duration: 0.3,
        ease: "easeOut",
      }}
    >
      {children}
    </motion.div>
  )
}
