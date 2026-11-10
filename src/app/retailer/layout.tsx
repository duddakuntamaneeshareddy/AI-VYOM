import { redirect } from "next/navigation"

import { requireRetailer } from "@/lib/auth/supabase-auth"
import { RetailerLayoutClient } from "@/components/retailer/retailer-layout-client"

export default async function RetailerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let profile
  try {
    profile = await requireRetailer()
  } catch {
    redirect("/login")
  }

  return <RetailerLayoutClient user={profile}>{children}</RetailerLayoutClient>
}
