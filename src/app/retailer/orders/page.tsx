import { redirect } from "next/navigation"
import { ShoppingCart } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { requireRetailer } from "@/lib/auth/supabase-auth"
import { getRetailerOrders } from "@/lib/db/queries"
import { OrderStatusBadge } from "@/components/admin/status-badge"
import { formatPrice } from "@/lib/utils"

export default async function RetailerOrdersPage() {
  let retailer
  try {
    retailer = await requireRetailer()
  } catch {
    redirect("/login")
  }

  const orders = await getRetailerOrders(retailer.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground">See who ordered your products.</p>
      </div>

      {orders.length === 0 ? (
        <div className="surface-bento flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted">
            <ShoppingCart className="size-7 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium">No orders yet</p>
          <p className="text-sm text-muted-foreground">
            Orders containing your products will appear here.
          </p>
        </div>
      ) : (
        <div className="surface-bento overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Order ID</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Items</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.map(({ order, customer, items }) => {
                  const total = items.reduce(
                    (sum, item) => sum + item.price_at_purchase * item.quantity,
                    0
                  )

                  return (
                    <tr key={order.id} className="hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium">#{order.id.slice(0, 8)}</td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{customer.full_name ?? "—"}</p>
                          <p className="text-xs text-muted-foreground">{customer.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {items.map((item) => (
                            <Badge key={item.id} variant="secondary" className="text-[10px]">
                              {item.product.name} ×{item.quantity}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-3 text-right font-medium">{formatPrice(total)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
