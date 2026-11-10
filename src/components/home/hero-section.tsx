"use client"

import { useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion"
import { ArrowRight, Sparkles, ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MagneticButton } from "@/components/ui/magnetic-button"
import type { Product } from "@/lib/db/types"

interface HeroSectionProps {
  featuredProducts: Product[]
}

const headingWords = ["Shop", "with", "AI"]

export function HeroSection({ featuredProducts }: HeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const shouldReduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], [0, shouldReduceMotion ? 0 : 120])
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36"
    >
      {/* Animated gradient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,var(--primary)/8%,transparent_50%)]" />
        <motion.div
          animate={{
            x: [0, 40, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-primary/10 blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -30, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -right-40 top-20 h-[500px] w-[500px] rounded-full bg-violet-500/10 blur-3xl"
        />
        <div
          className="absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage: "radial-gradient(circle, var(--border) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <motion.div
        style={{ y, opacity }}
        className="relative z-10 mx-auto max-w-6xl"
      >
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge
                variant="outline"
                className="mb-6 inline-flex rounded-full px-4 py-1.5 text-sm font-medium"
              >
                <Sparkles className="mr-2 size-4 text-primary" />
                AI-powered shopping
              </Badge>
            </motion.div>

            <h1 className="font-heading text-5xl font-bold leading-tight sm:text-6xl">
              {headingWords.map((word, i) => (
                <motion.span
                  key={i}
                  className="mr-3 inline-block"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.1 + i * 0.08,
                    ease: "easeOut",
                  }}
                >
                  {word === "AI" ? (
                    <span className="text-primary">{word}</span>
                  ) : (
                    word
                  )}
                </motion.span>
              ))}
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground sm:text-xl lg:mx-0"
            >
              Discover products, track orders, and get personalized recommendations
              through our intelligent AI assistant.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start"
            >
              <MagneticButton strength={0.25}>
                <Link href="/products">
                  <Button size="lg" className="rounded-full px-8">
                    Shop Now
                    <ArrowRight className="ml-2 size-4" />
                  </Button>
                </Link>
              </MagneticButton>
              <MagneticButton strength={0.2}>
                <Link href="#ai-assistant">
                  <Button variant="outline" size="lg" className="rounded-full px-8">
                    Learn More
                  </Button>
                </Link>
              </MagneticButton>
            </motion.div>
          </div>

          {/* Floating product preview */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
            className="relative hidden h-[420px] items-center justify-center lg:flex"
            style={{ perspective: 1000 }}
          >
            {featuredProducts.slice(0, 3).map((product, i) => (
              <motion.div
                key={product.id}
                initial={{
                  opacity: 0,
                  x: (i - 1) * 70,
                  y: (i - 1) * 40,
                  rotate: (i - 1) * 6,
                }}
                animate={{
                  opacity: 1,
                  y: [(i - 1) * 40, (i - 1) * 40 - 10 - i * 4, (i - 1) * 40],
                  rotateY: [0, i % 2 === 0 ? 4 : -4, 0],
                }}
                transition={{
                  duration: 5 + i * 0.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.2,
                }}
                className="absolute w-56 overflow-hidden rounded-2xl border border-border bg-card shadow-xl"
                style={{ zIndex: 3 - i }}
              >
                <div className="relative aspect-square bg-muted">
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="224px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      No image
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="truncate font-heading text-sm font-semibold">
                    {product.name}
                  </p>
                  <p className="text-sm font-medium text-primary">
                    ${product.price.toFixed(2)}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2"
      >
        <Link href="#ai-assistant" className="flex flex-col items-center gap-1 text-muted-foreground">
          <span className="text-xs font-medium">Scroll</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="size-5" />
          </motion.div>
        </Link>
      </motion.div>
    </section>
  )
}
