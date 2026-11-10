"use client"

import { usePathname } from "next/navigation"
import type { User as SupabaseUser } from "@supabase/supabase-js"

import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"

interface RouteShellProps {
  user: SupabaseUser | null
  children: React.ReactNode
}

const HIDDEN_NAV_FOOTER_PATHS = ["/", "/login", "/signup"]

function shouldHideNavFooter(pathname: string) {
  if (HIDDEN_NAV_FOOTER_PATHS.includes(pathname)) return true
  if (pathname === "/retailer" || pathname.startsWith("/retailer/")) return true
  return false
}

export function RouteShell({ user, children }: RouteShellProps) {
  const pathname = usePathname()
  const hideNavFooter = pathname === null || shouldHideNavFooter(pathname)

  return (
    <>
      {!hideNavFooter && <Navbar user={user} />}
      {children}
      {!hideNavFooter && <Footer />}
    </>
  )
}
