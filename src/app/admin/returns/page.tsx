import { redirect } from "next/navigation"

import { requireAdmin } from "@/lib/auth/supabase-auth"
import { getAllReturns } from "@/lib/db/queries"
import { ReturnsTable } from "@/components/admin/returns-table"

export default async function ReturnsAdminPage() {
  try {
    await requireAdmin()
  } catch {
    redirect("/login")
  }

  const returns = await getAllReturns()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Returns</h1>
        <p className="text-muted-foreground">
          Review and process customer return requests.
        </p>
      </div>
      <ReturnsTable returns={returns} />
    </div>
  )
}
