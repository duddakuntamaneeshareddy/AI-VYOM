"use client"

import * as React from "react"
import { Minus, Plus, ShoppingCart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { MagneticButton } from "@/components/ui/magnetic-button"
import { useCart } from "@/hooks/use-cart"
import { useFlyToCart } from "@/components/cart/fly-to-cart"
import type { Product } from "@/lib/db/types"
import { toast } from "sonner"

interface ProductAddToCartProps {
  product: Product
  imageRef?: React.RefObject<HTMLDivElement | null>
}

export function ProductAddToCart({ product, imageRef }: ProductAddToCartProps) {
  const { addToCart } = useCart()
  const { flyToCart } = useFlyToCart()
  const [quantity, setQuantity] = React.useState(1)
  const isOutOfStock = product.stock <= 0

  async function handleAddToCart() {
    const rect = imageRef?.current?.getBoundingClientRect()
    flyToCart(product.image_url, rect)

    try {
      await addToCart(product.id, quantity)
      toast.success(`${product.name} added to cart`)
      setQuantity(1)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add to cart")
    }
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          disabled={quantity <= 1}
          aria-label="Decrease quantity"
        >
          <Minus className="size-4" />
        </Button>
        <span className="w-10 text-center font-medium">{quantity}</span>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
          disabled={quantity >= product.stock}
          aria-label="Increase quantity"
        >
          <Plus className="size-4" />
        </Button>
      </div>
      <MagneticButton strength={0.2}>
        <Button
          size="lg"
          className="rounded-full"
          disabled={isOutOfStock}
          onClick={handleAddToCart}
        >
          <ShoppingCart className="mr-2 size-5" />
          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </Button>
      </MagneticButton>
    </div>
  )
}
