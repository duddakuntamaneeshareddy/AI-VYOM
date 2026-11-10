"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import { ProductCard } from "./product-card"
import type { Product } from "@/lib/db/types"

interface AIRecommendationsProps {
  productId: string
}

export function AIRecommendations({ productId }: AIRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Product[]>([])
  const [message, setMessage] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchRecommendations() {
      try {
        setLoading(true)
        const response = await fetch("/api/ai/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        })

        if (!response.ok) {
          throw new Error("Failed to load recommendations")
        }

        const data = await response.json()

        if (!cancelled) {
          setRecommendations(data.recommendations ?? [])
          setMessage(data.message ?? "")
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error")
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchRecommendations()

    return () => {
      cancelled = true
    }
  }, [productId])

  if (loading) {
    return (
      <div className="surface-bento mt-12">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-primary" />
          <h2 className="font-heading text-xl font-bold">AI Recommendations</h2>
        </div>
        <Skeleton className="mt-3 h-4 w-2/3" />
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="surface-bento mt-12">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-primary" />
          <h2 className="font-heading text-xl font-bold">AI Recommendations</h2>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Could not load recommendations right now. Please try again later.
        </p>
      </div>
    )
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="surface-bento mt-12"
    >
      <div className="flex items-center gap-2">
        <Sparkles className="size-5 text-primary" />
        <h2 className="font-heading text-xl font-bold">AI Recommendations</h2>
      </div>
      <p className="mt-2 text-muted-foreground">{message}</p>

      {recommendations.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {recommendations.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      )}
    </motion.section>
  )
}
