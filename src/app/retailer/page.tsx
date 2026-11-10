import { Suspense } from "react"
import { redirect } from "next/navigation"

import { requireRetailer } from "@/lib/auth/supabase-auth"
import { getProductsByRetailer, getRetailerOrders } from "@/lib/db/queries"
import { RetailerDashboard } from "@/components/retailer/retailer-dashboard"
import { StatCardSkeleton } from "@/components/ui/skeleton-card"

const LOW_STOCK_THRESHOLD = 5

async function DashboardData() {
  const retailer = await requireRetailer()
  const [products, orders] = await Promise.all([
    getProductsByRetailer(retailer.id),
    getRetailerOrders(retailer.id),
  ])

  const totalProducts = products.length
  const totalOrders = orders.length
  const lowStockCount = products.filter((p) => p.stock <= LOW_STOCK_THRESHOLD).length
  const revenue = orders.reduce(
    (sum, { items }) =>
      sum + items.reduce((itemSum, item) => itemSum + item.price_at_purchase * item.quantity, 0),
    0
  )

  const recentOrders = orders.slice(0, 5).map(({ order, customer, items }) => ({
    order,
    customer: {
      full_name: customer.full_name,
      email: customer.email,
    },
    items: items.map((item) => ({
      product_name: item.product.name,
      quantity: item.quantity,
    })),
    total: items.reduce((sum, item) => sum + item.price_at_purchase * item.quantity, 0),
  }))

  return (
    <RetailerDashboard
      totalProducts={totalProducts}
      totalOrders={totalOrders}
      lowStockCount={lowStockCount}
      revenue={revenue}
      recentOrders={recentOrders}
    />
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="h-8 w-56 animate-pulse rounded-md bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      <div className="surface-bento h-80" />
    </div>
  )
}

export default async function RetailerPage() {
  try {
    await requireRetailer()
  } catch {
    redirect("/login")
  }

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardData />
    </Suspense>
  )
}
