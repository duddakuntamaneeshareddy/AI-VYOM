import { redirect, notFound } from "next/navigation"

import { requireAdmin } from "@/lib/auth/supabase-auth"
import { getReturnByIdAdmin } from "@/lib/db/queries"
import { ReturnDetailClient } from "@/components/admin/return-detail-client"

interface ReturnDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ReturnDetailPage({ params }: ReturnDetailPageProps) {
  try {
    await requireAdmin()
  } catch {
    redirect("/login")
  }

  const { id } = await params
  const result = await getReturnByIdAdmin(id)

  if (!result) {
    notFound()
  }

  return (
    <ReturnDetailClient
      returnRecord={result.return}
      order={result.order}
      orderItem={result.orderItem}
      user={result.user}
    />
  )
}
