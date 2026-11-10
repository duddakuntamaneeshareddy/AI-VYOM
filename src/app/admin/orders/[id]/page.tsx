import { redirect, notFound } from "next/navigation"

import { requireAdmin } from "@/lib/auth/supabase-auth"
import { getOrderByIdAdmin } from "@/lib/db/queries"
import { OrderDetailClient } from "@/components/admin/order-detail-client"

interface OrderDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  try {
    await requireAdmin()
  } catch {
    redirect("/login")
  }

  const { id } = await params
  const result = await getOrderByIdAdmin(id)

  if (!result) {
    notFound()
  }

  return (
    <OrderDetailClient order={result.order} items={result.items} user={result.user} />
  )
}
