"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ShoppingCart, ArrowRight } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/hooks/use-cart"
import { useFlyToCart } from "@/components/cart/fly-to-cart"
import type { Product } from "@/lib/db/types"
import { toast } from "sonner"

interface FeaturedBentoProps {
  products: Product[]
}

function BentoCard({
  product,
  className,
  imageAspect,
  featured = false,
  index = 0,
}: {
  product: Product
  className?: string
  imageAspect: string
  featured?: boolean
  index?: number
}) {
  const { addToCart } = useCart()
  const { flyToCart } = useFlyToCart()
  const [adding, setAdding] = useState(false)
  const isOutOfStock = product.stock <= 0

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (adding || isOutOfStock) return
    setAdding(true)
    const rect = (e.currentTarget as HTMLElement)
      .closest("[data-card-image]")
      ?.getBoundingClientRect()
    flyToCart(product.image_url, rect)
    try {
      await addToCart(product.id, 1)
      toast.success(`${product.name} added to cart`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add to cart")
    } finally {
      setAdding(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: "easeOut" }}
      className={`group surface-bento overflow-hidden surface-bento-hover hover:shadow-xl ${className}`}
    >
      <Link href={`/products/${product.id}`} className="block">
        <div
          data-card-image
          className={`relative overflow-hidden rounded-xl bg-muted ${imageAspect}`}
        >
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No image
            </div>
          )}

          {/* Gradient overlay on featured card */}
          {featured && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          )}

          {/* Overlay CTA on featured card */}
          {featured && (
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
              <div>
                <p className="font-heading text-xl font-bold text-white drop-shadow">
                  {product.name}
                </p>
                <p className="text-sm font-semibold text-white/80">
                  ${product.price.toFixed(2)}
                </p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                className="rounded-full shadow-lg"
                disabled={isOutOfStock || adding}
                onClick={handleAddToCart}
              >
                <ShoppingCart className="mr-1.5 size-3.5" />
                Add
              </Button>
            </div>
          )}

          {isOutOfStock && !featured && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <Badge variant="secondary" className="text-xs uppercase">
                Out of stock
              </Badge>
            </div>
          )}
        </div>
      </Link>

      {/* Body — only shown on non-featured cards */}
      {!featured && (
        <div className="flex flex-col p-1 pt-3">
          <div className="mb-1.5 flex items-center gap-2">
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
            <h3 className="font-heading text-sm font-semibold leading-tight transition-colors hover:text-primary">
              {product.name}
            </h3>
          </Link>
          <div className="mt-auto flex items-center justify-between pt-3">
            <span className="font-heading text-base font-bold text-primary">
              ${product.price.toFixed(2)}
            </span>
            <Button
              size="sm"
              variant="ghost"
              className="size-8 rounded-full p-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              disabled={isOutOfStock || adding}
              onClick={handleAddToCart}
            >
              <ShoppingCart className="size-3.5" />
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export function FeaturedBento({ products }: FeaturedBentoProps) {
  if (products.length === 0) return null

  const [hero, ...rest] = products

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:grid-rows-2">
      {/* Hero — spans 2 cols × 2 rows */}
      {hero && (
        <BentoCard
          product={hero}
          className="col-span-2 row-span-2"
          imageAspect="aspect-[4/3] lg:aspect-auto lg:h-[420px]"
          featured
          index={0}
        />
      )}

      {/* 4 small cards filling the right 2 columns */}
      {rest.slice(0, 4).map((product, i) => (
        <BentoCard
          key={product.id}
          product={product}
          imageAspect="aspect-square"
          index={i + 1}
        />
      ))}
    </div>
  )
}
