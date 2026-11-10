import { redirect } from "next/navigation"

import { requireAdmin } from "@/lib/auth/supabase-auth"
import { getAllOrders } from "@/lib/db/queries"
import { OrdersTable } from "@/components/admin/orders-table"

export default async function OrdersAdminPage() {
  try {
    await requireAdmin()
  } catch {
    redirect("/login")
  }

  const orders = await getAllOrders()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground">
          Manage customer orders and update delivery status.
        </p>
      </div>
      <OrdersTable orders={orders} />
    </div>
  )
}
