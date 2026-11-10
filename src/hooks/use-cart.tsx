"use client"

import * as React from "react"
import type { CartItem, Product } from "@/lib/db/types"

type CartItemWithProduct = CartItem & { product: Product }

interface CartContextValue {
  items: CartItemWithProduct[]
  isLoading: boolean
  error: string | null
  cartCount: number
  cartTotal: number
  addToCart: (productId: string, quantity?: number) => Promise<void>
  removeFromCart: (itemId: string) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  refreshCart: () => Promise<void>
  clearCart: () => Promise<void>
}

const CartContext = React.createContext<CartContextValue | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CartItemWithProduct[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchCart = React.useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch("/api/cart")
      if (!response.ok) {
        if (response.status === 401) {
          setItems([])
          return
        }
        throw new Error("Failed to fetch cart")
      }
      const data = await response.json()
      setItems(data.items ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refreshCartSilent = React.useCallback(async () => {
    try {
      const response = await fetch("/api/cart")
      if (!response.ok) {
        if (response.status === 401) {
          setItems([])
          return
        }
        throw new Error("Failed to fetch cart")
      }
      const data = await response.json()
      setItems(data.items ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    }
  }, [])

  React.useEffect(() => {
    let cancelled = false

    async function loadCart() {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch("/api/cart")
        if (!response.ok) {
          if (response.status === 401) {
            if (!cancelled) setItems([])
            return
          }
          throw new Error("Failed to fetch cart")
        }
        const data = await response.json()
        if (!cancelled) setItems(data.items ?? [])
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error")
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    loadCart()

    return () => {
      cancelled = true
    }
  }, [])

  const addToCart = React.useCallback(
    async (productId: string, quantity = 1) => {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId, quantity }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to add to cart")
      }

      const data = await response.json()
      setItems(prev => {
        const existingIdx = prev.findIndex(i => i.product_id === productId)
        if (existingIdx >= 0) {
          const updated = [...prev]
          updated[existingIdx] = data.item
          return updated
        }
        return [data.item, ...prev]
      })
    },
    []
  )

  const removeFromCart = React.useCallback(
    async (itemId: string) => {
      setItems(prev => prev.filter(i => i.id !== itemId))
      try {
        const response = await fetch(`/api/cart/${itemId}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || "Failed to remove item")
        }
      } catch (err) {
        await refreshCartSilent()
        throw err
      }
    },
    [refreshCartSilent]
  )

  const updateQuantity = React.useCallback(
    async (itemId: string, quantity: number) => {
      if (quantity < 1) return
      setItems(prev => prev.map(i => (i.id === itemId ? { ...i, quantity } : i)))
      try {
        const response = await fetch("/api/cart", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ item_id: itemId, quantity }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || "Failed to update quantity")
        }
      } catch (err) {
        await refreshCartSilent()
        throw err
      }
    },
    [refreshCartSilent]
  )

  const clearCart = React.useCallback(async () => {
    // Optimistic update first — UI clears instantly
    setItems([])
    try {
      const response = await fetch("/api/cart?clearAll=true", {
        method: "DELETE",
      })
      if (!response.ok) {
        // Rollback by refreshing from server
        await refreshCartSilent()
      }
    } catch {
      await refreshCartSilent()
    }
  }, [refreshCartSilent])

  const cartCount = React.useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  )

  const cartTotal = React.useMemo(
    () => items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [items]
  )

  return (
    <CartContext.Provider
      value={{
        items,
        isLoading,
        error,
        cartCount,
        cartTotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        refreshCart: fetchCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = React.useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
