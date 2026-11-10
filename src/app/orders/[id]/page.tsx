import Link from "next/link"
import { redirect, notFound } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, Package, Truck, CheckCircle, Clock, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { getCurrentUser } from "@/lib/auth/supabase-auth"
import { getOrderById, getReturnsByOrderId } from "@/lib/db/queries"
import type { OrderStatus } from "@/lib/db/types"
import { ReturnStatusBadge } from "@/components/returns/return-status-badge"

const statusSteps: { status: OrderStatus; label: string; icon: typeof Clock }[] = [
  { status: "pending", label: "Order Placed", icon: Clock },
  { status: "confirmed", label: "Confirmed", icon: Package },
  { status: "shipped", label: "Shipped", icon: Truck },
  { status: "delivered", label: "Delivered", icon: CheckCircle },
]

const statusStyles: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  shipped: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
}

interface OrderDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }

  const { id } = await params
  const result = await getOrderById(id, user.id)

  if (!result) {
    notFound()
  }

  const { order, items } = result
  const address = order.shipping_address as Record<string, string> | null
  const activeStepIndex = statusSteps.findIndex((s) => s.status === order.status)
  const existingReturns = await getReturnsByOrderId(order.id)

  return (
    <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Link href="/orders">
          <Button variant="ghost" size="sm" className="mb-6 rounded-full">
            <ArrowLeft className="mr-2 size-4" />
            Back to orders
          </Button>
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold">
              Order #{order.id.slice(0, 8)}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Placed on {new Date(order.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={`w-fit capitalize ${statusStyles[order.status]}`}
            >
              {order.status}
            </Badge>
            {existingReturns.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {existingReturns.map((returnRecord) => (
                  <Link
                    key={returnRecord.id}
                    href={`/returns/${returnRecord.id}`}
                  >
                    <ReturnStatusBadge status={returnRecord.status} />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {order.status !== "cancelled" && (
          <div className="surface-bento mt-8">
            <h2 className="font-heading text-lg font-bold">Status Timeline</h2>
            <div className="mt-6 relative">
              <div className="absolute top-5 left-0 right-0 hidden h-0.5 bg-muted sm:block" />
              <div className="grid gap-6 sm:grid-cols-4">
                {statusSteps.map((step, index) => {
                  const Icon = step.icon
                  const isActive = index <= activeStepIndex
                  const isCurrent = index === activeStepIndex

                  return (
                    <div key={step.status} className="relative flex items-start gap-3 sm:block sm:text-center">
                      <div
                        className={`relative z-10 flex size-10 items-center justify-center rounded-full border-2 sm:mx-auto ${
                          isActive
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-muted bg-background text-muted-foreground"
                        } ${isCurrent ? "ring-4 ring-primary/20" : ""}`}
                      >
                        <Icon className="size-5" />
                      </div>
                      <div className="sm:mt-3">
                        <p className={`text-sm font-semibold ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                          {step.label}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="font-heading text-lg font-bold">Items</h2>
            {items.map((item) => (
              <div key={item.id} className="surface-bento flex gap-4">
                <div className="relative aspect-square size-20 overflow-hidden rounded-xl bg-muted">
                  {item.product.image_url ? (
                    <Image
                      src={item.product.image_url}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                      No image
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <p className="font-heading font-semibold">{item.product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      ${item.price_at_purchase.toFixed(2)} x {item.quantity}
                    </p>
                  </div>
                  <p className="font-bold">
                    ${(item.price_at_purchase * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="surface-bento sticky top-28 space-y-4">
              <h2 className="font-heading text-lg font-bold">Order Summary</h2>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-green-600 dark:text-green-400">Free</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${order.total.toFixed(2)}</span>
              </div>

              {address && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-heading font-semibold">Shipping Address</h3>
                    <address className="mt-2 not-italic text-sm text-muted-foreground">
                      <p className="font-medium text-foreground">{address.full_name}</p>
                      <p>{address.address}</p>
                      <p>
                        {address.city}, {address.state} {address.zip}
                      </p>
                      <p>{address.country}</p>
                    </address>
                  </div>
                </>
              )}

              {order.status === "delivered" && (
                <Link href={`/orders/${order.id}/return`} className="block">
                  <Button
                    variant="outline"
                    className="w-full rounded-full"
                  >
                    <RefreshCw className="mr-2 size-4" />
                    {existingReturns.length > 0
                      ? "Request Another Return"
                      : "Return / Refund"}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
