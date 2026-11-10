"use client"

import * as React from "react"
import { createContext, useContext, useState, useCallback } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"

interface FlyToCartItem {
  id: string
  imageUrl: string | null
  startRect: DOMRect
}

interface FlyToCartContextValue {
  flyToCart: (imageUrl: string | null, startRect?: DOMRect | null) => void
  bump: number
}

const FlyToCartContext = createContext<FlyToCartContextValue | null>(null)

export function useFlyToCart() {
  const context = useContext(FlyToCartContext)
  if (!context) {
    throw new Error("useFlyToCart must be used within FlyToCartProvider")
  }
  return context
}

export function FlyToCartProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState<FlyToCartItem | null>(null)
  const [bump, setBump] = useState(0)

  const flyToCart = useCallback(
    (imageUrl: string | null, startRect?: DOMRect | null) => {
      if (!startRect) return
      setActive({ id: crypto.randomUUID(), imageUrl, startRect })
    },
    []
  )

  const handleComplete = useCallback(() => {
    setActive(null)
    setBump((b) => b + 1)
  }, [])

  return (
    <FlyToCartContext.Provider value={{ flyToCart, bump }}>
      {children}
      <FlyToCartOverlay item={active} onComplete={handleComplete} />
    </FlyToCartContext.Provider>
  )
}

function FlyToCartOverlay({
  item,
  onComplete,
}: {
  item: FlyToCartItem | null
  onComplete: () => void
}) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <AnimatePresence>
      {item && (
        <FlyingParticle
          key={item.id}
          imageUrl={item.imageUrl}
          startRect={item.startRect}
          onComplete={onComplete}
          reduceMotion={shouldReduceMotion ?? false}
        />
      )}
    </AnimatePresence>
  )
}

function FlyingParticle({
  imageUrl,
  startRect,
  onComplete,
  reduceMotion,
}: {
  imageUrl: string | null
  startRect: DOMRect
  onComplete: () => void
  reduceMotion: boolean
}) {
  const [targetRect, setTargetRect] = React.useState<DOMRect | null>(null)

  React.useLayoutEffect(() => {
    const target = document.querySelector("[data-cart-trigger]")
    if (target) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTargetRect(target.getBoundingClientRect())
    }
  }, [])

  const baseSize = 56
  const startX = startRect.left + startRect.width / 2 - baseSize / 2
  const startY = startRect.top + startRect.height / 2 - baseSize / 2
  const startScale = Math.max(
    0.5,
    Math.min(startRect.width / baseSize, startRect.height / baseSize)
  )

  const endScale = 0.35
  let deltaX = 0
  let deltaY = 0

  if (targetRect) {
    const targetCenterX = targetRect.left + targetRect.width / 2
    const targetCenterY = targetRect.top + targetRect.height / 2
    const startCenterX = startRect.left + startRect.width / 2
    const startCenterY = startRect.top + startRect.height / 2
    deltaX = targetCenterX - startCenterX
    deltaY = targetCenterY - startCenterY
  }

  if (reduceMotion) {
    return null
  }

  return (
    <motion.div
      initial={{
        x: 0,
        y: 0,
        scale: startScale,
        opacity: 1,
      }}
      animate={{
        x: deltaX,
        y: deltaY,
        scale: endScale,
        opacity: [1, 1, 0.6],
      }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 0.55,
        ease: [0.22, 1, 0.36, 1],
      }}
      onAnimationComplete={onComplete}
      className="pointer-events-none fixed z-[100] rounded-xl shadow-2xl"
      style={{
        left: startX,
        top: startY,
        width: baseSize,
        height: baseSize,
      }}
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt=""
          className="h-full w-full rounded-xl object-cover"
        />
      ) : (
        <div className="h-full w-full rounded-xl bg-primary" />
      )}
    </motion.div>
  )
}
