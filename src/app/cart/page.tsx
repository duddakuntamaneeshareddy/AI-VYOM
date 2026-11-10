"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useCart } from "@/hooks/use-cart"
import { toast } from "sonner"
import { VisibleProductsRegistrar } from "@/components/product/visible-products-registrar"

export default function CartPage() {
  const { items, cartTotal, isLoading, updateQuantity, removeFromCart } = useCart()

  // Register cart products as visible so the AI can identify them by name
  const visibleCartProducts = items.map((item) => ({
    id: item.product.id,
    name: item.product.name,
  }))

  if (isLoading) {
    return (
      <main className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-muted-foreground">Loading your cart...</div>
      </main>
    )
  }

  if (items.length === 0) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="surface-bento mx-auto max-w-md space-y-6 p-8">
          <ShoppingBag className="mx-auto size-16 text-muted-foreground" />
          <div>
            <h1 className="font-heading text-2xl font-bold">Your cart is empty</h1>
            <p className="mt-2 text-muted-foreground">
              Looks like you haven&apos;t added anything yet.
            </p>
          </div>
          <Link href="/products">
            <Button className="rounded-full">Continue Shopping</Button>
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <VisibleProductsRegistrar products={visibleCartProducts} />
      <div className="mx-auto max-w-5xl">
        <h1 className="font-heading text-3xl font-bold">Shopping Cart</h1>
        <p className="mt-2 text-muted-foreground">
          Review your items and proceed to checkout.
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ScrollArea className="h-[calc(100vh-20rem)] rounded-2xl">
              <AnimatePresence initial={false}>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.2 }}
                    className="surface-bento mb-4"
                  >
                    <div className="flex gap-4">
                      <div className="relative aspect-square size-24 overflow-hidden rounded-xl bg-muted">
                        {item.product.image_url ? (
                          <Image
                            src={item.product.image_url}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                            sizes="96px"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <Link href={`/products/${item.product.id}`}>
                            <h3 className="font-heading text-base font-semibold hover:text-primary">
                              {item.product.name}
                            </h3>
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            ${item.product.price.toFixed(2)} each
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="icon-sm"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1).catch(
                                (err) => toast.error(err.message)
                              )
                            }
                            disabled={item.quantity <= 1}
                            aria-label="Decrease quantity"
                          >
                            <Minus className="size-4" />
                          </Button>
                          <span className="w-6 text-center font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon-sm"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1).catch(
                                (err) => toast.error(err.message)
                              )
                            }
                            aria-label="Increase quantity"
                          >
                            <Plus className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="ml-auto text-destructive"
                            onClick={() =>
                              removeFromCart(item.id).catch((err) =>
                                toast.error(err.message)
                              )
                            }
                            aria-label="Remove item"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </ScrollArea>
          </div>

          <div className="lg:col-span-1">
            <div className="surface-bento sticky top-28 space-y-4">
              <h2 className="font-heading text-lg font-bold">Order Summary</h2>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-green-600 dark:text-green-400">Free</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <Link href="/checkout" className="block">
                <Button size="lg" className="w-full rounded-full">
                  Checkout
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </Link>
              <Link href="/products" className="block">
                <Button variant="outline" size="lg" className="w-full rounded-full">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
