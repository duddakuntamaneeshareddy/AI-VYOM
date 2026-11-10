import Link from "next/link"
import { redirect, notFound } from "next/navigation"
import { ArrowLeft, Package } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getCurrentUser } from "@/lib/auth/supabase-auth"
import { getOrderById, getReturnsByOrderId } from "@/lib/db/queries"
import { ReturnForm } from "@/components/returns/return-form"
import { ReturnStatusBadge } from "@/components/returns/return-status-badge"

interface ReturnPageProps {
  params: Promise<{ id: string }>
}

export default async function OrderReturnPage({ params }: ReturnPageProps) {
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

  if (order.status !== "delivered") {
    redirect(`/orders/${order.id}`)
  }

  const existingReturns = await getReturnsByOrderId(order.id)
  const hasExistingReturns = existingReturns.length > 0

  return (
    <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Link href={`/orders/${order.id}`}>
          <Button variant="ghost" size="sm" className="mb-6 rounded-full">
            <ArrowLeft className="mr-2 size-4" />
            Back to order
          </Button>
        </Link>

        <div className="mb-6">
          <h1 className="font-heading text-3xl font-bold">
            Return / Refund
          </h1>
          <p className="mt-2 text-muted-foreground">
            Order #{order.id.slice(0, 8)}
          </p>
        </div>

        {hasExistingReturns && (
          <div className="surface-bento mb-6 border-yellow-200 bg-yellow-50/50 dark:border-yellow-900/30 dark:bg-yellow-900/10">
            <div className="flex items-start gap-3">
              <Package className="mt-0.5 size-5 text-yellow-600 dark:text-yellow-400" />
              <div>
                <h3 className="font-heading font-semibold">
                  Return already requested
                </h3>
                <p className="text-sm text-muted-foreground">
                  This order already has one or more return requests.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {existingReturns.map((returnRecord) => (
                    <Link
                      key={returnRecord.id}
                      href={`/returns/${returnRecord.id}`}
                    >
                      <ReturnStatusBadge status={returnRecord.status} />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <ReturnForm orderId={order.id} items={items} />
      </div>
    </main>
  )
}
