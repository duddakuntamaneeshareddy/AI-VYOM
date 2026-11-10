"use client"

import { useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useMotionValue, useSpring } from "framer-motion"
import { ShoppingCart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/hooks/use-cart"
import { useFlyToCart } from "@/components/cart/fly-to-cart"
import type { Product } from "@/lib/db/types"
import { toast } from "sonner"

interface ProductCardProps {
  product: Product
  index?: number
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addToCart } = useCart()
  const { flyToCart } = useFlyToCart()
  const imageRef = useRef<HTMLDivElement>(null)
  const isOutOfStock = product.stock <= 0

  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)
  const springConfig = { stiffness: 300, damping: 30 }
  const springRotateX = useSpring(rotateX, springConfig)
  const springRotateY = useSpring(rotateY, springConfig)

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    rotateY.set(x * 8)
    rotateX.set(-y * 8)
  }

  function handleMouseLeave() {
    rotateX.set(0)
    rotateY.set(0)
  }

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    const rect = imageRef.current?.getBoundingClientRect()
    flyToCart(product.image_url, rect)

    try {
      await addToCart(product.id, 1)
      toast.success(`${product.name} added to cart`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add to cart")
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: springRotateX,
        rotateY: springRotateY,
        transformStyle: "preserve-3d",
      }}
      className="surface-bento group flex h-full flex-col overflow-hidden surface-bento-hover hover:shadow-xl"
    >
      <Link href={`/products/${product.id}`} className="block">
        <div
          ref={imageRef}
          className="relative aspect-square overflow-hidden rounded-xl bg-muted"
        >
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No image
            </div>
          )}

          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <Badge variant="secondary" className="text-xs uppercase">
                Out of stock
              </Badge>
            </div>
          )}

          {/* Mobile quick-add is in the card footer below */}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-1 pt-4">
        <div className="mb-2 flex items-center gap-2">
          <Badge variant="outline" className="text-[10px]">
            {product.category}
          </Badge>
          {isOutOfStock && (
            <Badge variant="secondary" className="text-[10px]">
              Out of stock
            </Badge>
          )}
        </div>
        <Link href={`/products/${product.id}`}>
          <h3 className="font-heading text-base font-semibold leading-tight transition-colors hover:text-primary">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
          {product.description}
        </p>
        <div className="mt-auto flex items-center justify-between pt-4">
          <motion.span
            className="font-heading text-xl font-bold text-primary"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            ${product.price.toFixed(2)}
          </motion.span>
          <Button
            size="sm"
            variant="outline"
            className="rounded-full opacity-0 transition-opacity duration-200 group-hover:opacity-100"
            disabled={isOutOfStock}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="mr-1.5 size-3.5" />
            Add
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
