import { redirect } from "next/navigation"

import { requireAdmin } from "@/lib/auth/supabase-auth"
import { AdminLayoutClient } from "@/components/admin/admin-layout-client"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let profile
  try {
    profile = await requireAdmin()
  } catch {
    redirect("/login")
  }

  return <AdminLayoutClient user={profile}>{children}</AdminLayoutClient>
}
