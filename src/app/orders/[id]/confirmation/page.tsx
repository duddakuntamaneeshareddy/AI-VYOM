import Link from "next/link"
import { redirect } from "next/navigation"
import { CheckCircle, ShoppingBag } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getCurrentUser } from "@/lib/auth/supabase-auth"
import { getOrderById } from "@/lib/db/queries"

interface OrderConfirmationPageProps {
  params: Promise<{ id: string }>
}

export default async function OrderConfirmationPage({
  params,
}: OrderConfirmationPageProps) {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }

  const { id } = await params
  const result = await getOrderById(id, user.id)

  if (!result) {
    redirect("/orders")
  }

  const { order } = result

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="surface-bento mx-auto max-w-lg space-y-6 p-8 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <CheckCircle className="size-8 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="font-heading text-3xl font-bold">Order Confirmed!</h1>
        <p className="text-muted-foreground">
          Thank you for your purchase. Your order number is{" "}
          <span className="font-mono font-medium text-foreground">#{order.id.slice(0, 8)}</span>
        </p>
        <div className="rounded-xl bg-muted p-4 text-left">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Status</span>
            <span className="font-medium capitalize">{order.status}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-muted-foreground">Total</span>
            <span className="font-bold">${order.total.toFixed(2)}</span>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href={`/orders/${order.id}`} className="flex-1">
            <Button variant="outline" className="w-full rounded-full">
              View Order Details
            </Button>
          </Link>
          <Link href="/products" className="flex-1">
            <Button className="w-full rounded-full">
              <ShoppingBag className="mr-2 size-4" />
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
