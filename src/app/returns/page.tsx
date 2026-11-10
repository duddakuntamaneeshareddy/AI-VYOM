import Link from "next/link"
import { redirect } from "next/navigation"
import { motion } from "framer-motion"
import { Package, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getCurrentUser } from "@/lib/auth/supabase-auth"
import { getReturnsByUser } from "@/lib/db/queries"
import { ReturnStatusBadge } from "@/components/returns/return-status-badge"

export default async function ReturnsPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }

  const returns = await getReturnsByUser(user.id)

  return (
    <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="font-heading text-3xl font-bold">Your Returns</h1>
        <p className="mt-2 text-muted-foreground">
          Track and manage your return requests.
        </p>

        {returns.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="surface-bento mt-8 flex flex-col items-center justify-center py-16 text-center"
          >
            <Package className="size-12 text-muted-foreground" />
            <h2 className="mt-4 font-heading text-xl font-bold">
              No returns yet
            </h2>
            <p className="mt-2 text-muted-foreground">
              You haven&apos;t submitted any return requests.
            </p>
            <Link href="/orders" className="mt-4">
              <Button className="rounded-full">View Orders</Button>
            </Link>
          </motion.div>
        ) : (
          <div className="mt-8 space-y-4">
            {returns.map((returnRecord, index) => (
              <motion.div
                key={returnRecord.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Link href={`/returns/${returnRecord.id}`}>
                  <div className="surface-bento group surface-bento-hover">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-heading font-semibold">
                          Return #{returnRecord.id.slice(0, 8)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Order #{returnRecord.order_id.slice(0, 8)} •{" "}
                          {new Date(returnRecord.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <ReturnStatusBadge status={returnRecord.status} />
                        <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                    <p className="mt-3 line-clamp-1 text-sm text-muted-foreground">
                      {returnRecord.reason}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
