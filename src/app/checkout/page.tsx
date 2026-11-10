"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Loader2, ArrowLeft, CreditCard, Truck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/hooks/use-cart"
import { toast } from "sonner"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, cartTotal, isLoading: cartLoading, refreshCart, clearCart } = useCart()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const [shipping, setShipping] = React.useState({
    full_name: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  })

  React.useEffect(() => {
    refreshCart()
  }, [refreshCart])


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shipping_address: shipping }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to place order")
      }

      clearCart()
      toast.success("Order placed successfully!")
      router.push(`/orders/${data.orderId}/confirmation`)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to place order")
      setIsSubmitting(false)
    }
  }

  if (cartLoading) {
    return (
      <main className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-muted-foreground">Loading checkout...</div>
      </main>
    )
  }

  if (items.length === 0) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="surface-bento mx-auto max-w-md space-y-6 p-8">
          <h1 className="font-heading text-2xl font-bold">Your cart is empty</h1>
          <p className="text-muted-foreground">
            Add some items before checking out.
          </p>
          <Link href="/products">
            <Button className="rounded-full">Shop Now</Button>
          </Link>
        </div>
      </main>
    )
  }

  const shippingFields: { key: keyof typeof shipping; label: string; type?: string }[] = [
    { key: "full_name", label: "Full Name" },
    { key: "address", label: "Street Address" },
    { key: "city", label: "City" },
    { key: "state", label: "State / Province" },
    { key: "zip", label: "ZIP / Postal Code" },
    { key: "country", label: "Country" },
  ]

  return (
    <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Link href="/cart">
          <Button variant="ghost" size="sm" className="mb-6 rounded-full">
            <ArrowLeft className="mr-2 size-4" />
            Back to cart
          </Button>
        </Link>

        <h1 className="font-heading text-3xl font-bold">Checkout</h1>
        <p className="mt-2 text-muted-foreground">
          Complete your order with secure mock payment.
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-2"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="surface-bento space-y-4">
                <div className="flex items-center gap-2">
                  <Truck className="size-5 text-primary" />
                  <h2 className="font-heading text-lg font-bold">Shipping Address</h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {shippingFields.map((field) => (
                    <div key={field.key} className="space-y-2">
                      <Label htmlFor={field.key}>{field.label}</Label>
                      <Input
                        id={field.key}
                        type={field.type || "text"}
                        required
                        value={shipping[field.key]}
                        onChange={(e) =>
                          setShipping((s) => ({ ...s, [field.key]: e.target.value }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="surface-bento space-y-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="size-5 text-primary" />
                  <h2 className="font-heading text-lg font-bold">Payment</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  This is a demo checkout. No real payment will be processed.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="card_number">Card Number</Label>
                    <Input
                      id="card_number"
                      placeholder="4242 4242 4242 4242"
                      disabled
                      className="opacity-70"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="card_name">Name on Card</Label>
                    <Input
                      id="card_name"
                      placeholder="Jane Doe"
                      disabled
                      className="opacity-70"
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full rounded-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 size-5 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  "Place Order"
                )}
              </Button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="surface-bento sticky top-28 space-y-4">
              <h2 className="font-heading text-lg font-bold">Order Summary</h2>
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.product.name} x{item.quantity}
                    </span>
                    <span>
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-green-600 dark:text-green-400">Free</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  )
}
