"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  RotateCcw,
  Megaphone,
  Bell,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import type { Profile } from "@/lib/db/types"

interface AdminSidebarProps {
  user: Profile
  onNavClick?: () => void
}

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

const navItems: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/returns", label: "Returns", icon: RotateCcw },
  { href: "/admin/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
]

function isActive(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === "/admin"
  }
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function AdminSidebar({ user, onNavClick }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <LayoutDashboard className="size-5" />
        </div>
        <div>
          <p className="font-heading text-base font-semibold">Admin Panel</p>
          <p className="text-xs text-muted-foreground">AI VYOM</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2" aria-label="Admin navigation">
        {navItems.map((item, index) => {
          const active = isActive(pathname, item.href)
          const Icon = item.icon

          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.25 }}
            >
              <Link
                href={item.href}
                onClick={onNavClick}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="size-5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            </motion.div>
          )
        })}
      </nav>

      <div className="border-t p-4">
        <div className="surface-bento space-y-1">
          <p className="text-sm font-medium">{user.full_name ?? user.email}</p>
          <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
        </div>
      </div>
    </div>
  )
}
