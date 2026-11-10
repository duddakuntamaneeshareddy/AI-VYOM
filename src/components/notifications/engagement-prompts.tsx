"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { toast } from "sonner"
import { ShoppingBag, Sparkles, RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"

const PROMPT_COOLDOWN_MS = 5 * 60 * 1000
const PRODUCT_VIEW_MS = 2 * 60 * 1000
const CART_AGE_MS = 10 * 60 * 1000
const CART_POLL_MS = 30_000

const STORAGE_KEYS = {
  lastPrompt: "ai-vyom-last-prompt",
  returningUser: "ai-vyom-returning-user",
}

function canShowPrompt(): boolean {
  if (typeof window === "undefined") return false
  const last = Number(localStorage.getItem(STORAGE_KEYS.lastPrompt) ?? "0")
  return Date.now() - last > PROMPT_COOLDOWN_MS
}

function recordPrompt() {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEYS.lastPrompt, String(Date.now()))
}

function showPromptToast({
  id,
  icon,
  title,
  description,
  cta,
  onCta,
}: {
  id: string
  icon: React.ReactNode
  title: string
  description: string
  cta: string
  onCta: () => void
}) {
  if (!canShowPrompt()) return

  recordPrompt()

  toast(title, {
    id,
    icon,
    description,
    duration: 12_000,
    action: (
      <Button size="xs" onClick={onCta} className="h-7 px-2 text-xs">
        {cta}
      </Button>
    ),
  })
}

export function EngagementPrompts() {
  const pathname = usePathname()
  const productViewTimerRef = React.useRef<NodeJS.Timeout | null>(null)
  const returningPromptShownRef = React.useRef(false)

  // Returning user prompt.
  React.useEffect(() => {
    if (typeof window === "undefined") return
    if (returningPromptShownRef.current) return

    const isReturning = localStorage.getItem(STORAGE_KEYS.returningUser) === "true"
    if (!isReturning) {
      localStorage.setItem(STORAGE_KEYS.returningUser, "true")
      return
    }

    returningPromptShownRef.current = true

    showPromptToast({
      id: "engagement-returning",
      icon: <Sparkles className="size-4 text-violet-500" />,
      title: "Welcome back!",
      description: "Ready to discover something new today?",
      cta: "Shop now",
      onCta: () => {
        window.location.href = "/products"
      },
    })
  }, [])

  // Product browsing prompt.
  React.useEffect(() => {
    if (productViewTimerRef.current) {
      clearTimeout(productViewTimerRef.current)
      productViewTimerRef.current = null
    }

    const isProductPage = pathname?.startsWith("/products")
    if (!isProductPage) return

    productViewTimerRef.current = setTimeout(() => {
      showPromptToast({
        id: "engagement-browsing",
        icon: <ShoppingBag className="size-4 text-primary" />,
        title: "Still browsing?",
        description: "Find it hard to choose? Our AI assistant can help.",
        cta: "Ask AI",
        onCta: () => {
          // Dispatch a custom event that the floating bot can listen to.
          window.dispatchEvent(new CustomEvent("ai-vyom:open-bot"))
        },
      })
    }, PRODUCT_VIEW_MS)

    return () => {
      if (productViewTimerRef.current) {
        clearTimeout(productViewTimerRef.current)
      }
    }
  }, [pathname])

  // Cart abandonment prompt.
  React.useEffect(() => {
    async function checkCartAge() {
      try {
        const response = await fetch("/api/cart")
        if (!response.ok) return

        const data = (await response.json()) as {
          items?: Array<{ added_at?: string; product?: { name?: string } }>
        }
        const items = data.items ?? []
        if (items.length === 0) return

        const now = Date.now()
        const hasOldItem = items.some((item) => {
          const addedAt = item.added_at ? new Date(item.added_at).getTime() : now
          return now - addedAt > CART_AGE_MS
        })

        if (!hasOldItem) return

        showPromptToast({
          id: "engagement-cart",
          icon: <RotateCcw className="size-4 text-cyan-500" />,
          title: "Your cart is waiting",
          description: "Items in your cart have been reserved for you — complete your order before they sell out.",
          cta: "Go to cart",
          onCta: () => {
            window.location.href = "/cart"
          },
        })
      } catch (error) {
        console.error("Engagement cart check error:", error)
      }
    }

    checkCartAge()

    const interval = setInterval(checkCartAge, CART_POLL_MS)
    return () => clearInterval(interval)
  }, [])

  return null
}
