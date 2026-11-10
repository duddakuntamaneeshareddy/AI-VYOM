"use client"

import { useRouter } from "next/navigation"
import { createClient } from "@/lib/db/supabase"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { toast } from "sonner"

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success("Logged out successfully")
    router.push("/")
    router.refresh()
  }

  return (
    <Button
      variant="ghost"
      className={className}
      onClick={handleLogout}
      data-slot="logout-button"
    >
      <LogOut className="mr-2 size-4" />
      Logout
    </Button>
  )
}
