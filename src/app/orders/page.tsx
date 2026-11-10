import Link from "next/link"
import { redirect } from "next/navigation"
import { Package } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getCurrentUser } from "@/lib/auth/supabase-auth"
import { getOrdersByUser } from "@/lib/db/queries"
import { OrderCard } from "@/components/orders/order-card"

export default async function OrdersPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }

  const orders = await getOrdersByUser(user.id)

  return (
    <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="font-heading text-3xl font-bold">Your Orders</h1>
        <p className="mt-2 text-muted-foreground">
          Track and manage your purchases.
        </p>

        {orders.length === 0 ? (
          <div className="surface-bento mt-8 flex flex-col items-center justify-center py-16 text-center">
            <Package className="size-12 text-muted-foreground" />
            <h2 className="mt-4 font-heading text-xl font-bold">No orders yet</h2>
            <p className="mt-2 text-muted-foreground">
              Start shopping to see your orders here.
            </p>
            <Link href="/products" className="mt-4">
              <Button className="rounded-full">Shop Now</Button>
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {orders.map((order, index) => (
              <OrderCard key={order.id} order={order} index={index} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
