"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Menu, Package } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { LogoutButton } from "@/components/auth/logout-button"
import { RetailerSidebar } from "./retailer-sidebar"
import { cn } from "@/lib/utils"
import type { Profile } from "@/lib/db/types"

interface RetailerLayoutClientProps {
  user: Profile
  children: React.ReactNode
}

export function RetailerLayoutClient({ user, children }: RetailerLayoutClientProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false)

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Desktop sidebar */}
      <motion.aside
        initial={{ x: -64, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r lg:flex",
          "glass dark:glass-dark"
        )}
      >
        <RetailerSidebar user={user} />
      </motion.aside>

      {/* Main content area */}
      <div className="flex w-full flex-1 flex-col lg:pl-64">
        <header
          className={cn(
            "sticky top-0 z-30 flex items-center justify-between border-b px-4 py-3",
            "glass dark:glass-dark"
          )}
        >
          <div className="flex items-center gap-3 lg:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger
                render={
                  <Button variant="ghost" size="icon" aria-label="Open retailer menu">
                    <Menu className="size-5" />
                  </Button>
                }
              />
              <SheetContent side="left" className="w-64 p-0" showCloseButton={false}>
                <SheetTitle className="sr-only">Retailer navigation</SheetTitle>
                <div className="flex h-full flex-col bg-popover">
                  <div className="flex items-center gap-3 border-b px-5 py-4">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-violet-600 text-white">
                      <Package className="size-5" />
                    </div>
                    <div>
                      <p className="font-heading text-base font-semibold">Retailer Portal</p>
                    </div>
                  </div>
                  <div className="flex-1 overflow-auto">
                    <RetailerSidebar user={user} onNavClick={() => setMobileOpen(false)} />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <span className="font-heading text-base font-semibold">Retailer</span>
          </div>

          <div className="ml-auto flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium leading-tight">
                {user.full_name ?? user.email}
              </p>
              <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
            </div>
            <LogoutButton />
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
