"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
  Menu,
  ShoppingCart,
  User,
  Package,
  Bell,
  Megaphone,
  Truck,
  ShoppingBag,
  Check,
  Loader2,
} from "lucide-react"
import type { User as SupabaseUser } from "@supabase/supabase-js"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useCart } from "@/hooks/use-cart"
import { useFlyToCart } from "@/components/cart/fly-to-cart"
import { LogoutButton } from "@/components/auth/logout-button"
import { cn } from "@/lib/utils"
import type { Notification } from "@/lib/db/types"

interface NavbarProps {
  user: SupabaseUser | null
}

const navLinks = [
  { href: "/products", label: "Products" },
]

const NOTIFICATION_POLL_MS = 30_000

function formatRelativeTime(date: string): string {
  const now = new Date()
  const then = new Date(date)
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000)

  if (seconds < 60) return "Just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function getNotificationIcon(type: Notification["type"]) {
  switch (type) {
    case "cart_abandonment":
      return <ShoppingBag className="size-4 text-primary" />
    case "delivery":
      return <Truck className="size-4 text-cyan-500" />
    case "campaign":
      return <Megaphone className="size-4 text-violet-500" />
    case "engagement":
    default:
      return <Bell className="size-4 text-muted-foreground" />
  }
}

function NotificationBell({ user }: { user: SupabaseUser | null }) {
  const [notifications, setNotifications] = React.useState<Notification[]>([])
  const [markingAll, setMarkingAll] = React.useState(false)
  const [open, setOpen] = React.useState(false)

  const unreadCount = React.useMemo(
    () =>
      notifications.filter(
        (n) => !((n.content as Record<string, unknown>)?.read === true)
      ).length,
    [notifications]
  )

  const fetchNotifications = React.useCallback(async () => {
    if (!user) return

    try {
      const response = await fetch("/api/notifications")
      if (!response.ok) {
        if (response.status === 401) {
          setNotifications([])
        }
        return
      }
      const data = (await response.json()) as { notifications?: Notification[] }
      setNotifications(data.notifications ?? [])
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    }
  }, [user])

  React.useEffect(() => {
    fetchNotifications()

    const interval = setInterval(fetchNotifications, NOTIFICATION_POLL_MS)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  const markAllAsRead = React.useCallback(async () => {
    if (!user || notifications.length === 0) return

    setMarkingAll(true)
    try {
      const unread = notifications.filter(
        (n) => !((n.content as Record<string, unknown>)?.read === true)
      )

      await Promise.all(
        unread.map((n) =>
          fetch(`/api/notifications/${n.id}/read`, { method: "PATCH" })
        )
      )

      await fetchNotifications()
    } catch (error) {
      console.error("Failed to mark notifications as read:", error)
    } finally {
      setMarkingAll(false)
    }
  }, [user, notifications, fetchNotifications])

  if (!user) {
    return null
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label="Notifications"
          >
            <Bell className="size-5" />
            {unreadCount > 0 && (
              <Badge
                variant="default"
                className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full p-0 text-[10px]"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border p-3">
          <span className="font-heading text-sm font-semibold">
            Notifications
          </span>
          <Button
            variant="ghost"
            size="xs"
            onClick={markAllAsRead}
            disabled={markingAll || unreadCount === 0}
            className="h-auto gap-1 px-2 py-1 text-xs"
          >
            {markingAll ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <Check className="size-3" />
            )}
            Mark all read
          </Button>
        </div>

        <ScrollArea className="max-h-80">
          {notifications.length === 0 ? (
            <div className="px-3 py-8 text-center text-sm text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notification) => {
                const content = notification.content as Record<string, unknown>
                const isRead = content?.read === true
                const message =
                  typeof content?.message === "string"
                    ? content.message
                    : `${notification.type.replace("_", " ")} notification`

                return (
                  <div
                    key={notification.id}
                    className={cn(
                      "flex items-start gap-3 border-b border-border p-3 last:border-b-0",
                      !isRead && "bg-muted/40"
                    )}
                  >
                    <div className="mt-0.5 shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-snug text-foreground">
                        {message}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatRelativeTime(notification.created_at)}
                      </p>
                    </div>
                    {!isRead && (
                      <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname()
  const { cartCount } = useCart()
  const { bump } = useFlyToCart()
  const [mobileOpen, setMobileOpen] = React.useState(false)

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="sticky top-0 z-40 flex w-full justify-center px-4 sm:px-6 lg:px-8"
    >
      <nav className="glass mt-3 w-full max-w-5xl rounded-2xl px-4 py-2">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-heading text-xl font-bold tracking-tight">
              <span className="text-primary">AI</span> VYOM
            </span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button
                  variant={pathname === link.href ? "secondary" : "ghost"}
                  size="sm"
                  className={cn(
                    "rounded-full",
                    pathname === link.href && "bg-secondary"
                  )}
                >
                  {link.label}
                </Button>
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <NotificationBell user={user} />

            <Link href="/cart">
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                aria-label="Open cart"
                data-cart-trigger
              >
                <ShoppingCart className="size-5" />
                {cartCount > 0 && (
                  <motion.span
                    key={bump}
                    initial={{ scale: 1.4 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    className="absolute -top-1 -right-1"
                  >
                    <Badge
                      variant="default"
                      className="flex size-5 items-center justify-center rounded-full p-0 text-[10px]"
                    >
                      {cartCount > 99 ? "99+" : cartCount}
                    </Badge>
                  </motion.span>
                )}
              </Button>
            </Link>

            <div className="hidden items-center gap-2 md:flex">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button variant="ghost" size="sm" className="rounded-full">
                        <User className="mr-2 size-4" />
                        {user.email?.split("@")[0] || "Account"}
                      </Button>
                    }
                  />
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      render={
                        <Link href="/orders" className="cursor-pointer">
                          <Package className="mr-2 size-4" />
                          Orders
                        </Link>
                      }
                    />
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      render={
                        <LogoutButton className="w-full justify-start rounded-sm" />
                      }
                    />
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="rounded-full">
                      Log in
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm" className="rounded-full">
                      Sign up
                    </Button>
                  </Link>
                </>
              )}
            </div>

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    aria-label="Open menu"
                  >
                    <Menu className="size-5" />
                  </Button>
                }
              />
              <SheetContent side="left" className="w-3/4 sm:max-w-xs">
                <SheetHeader>
                  <SheetTitle className="font-heading text-xl">
                    <span className="text-primary">AI</span> VYOM
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6 flex flex-col gap-2">
                  {navLinks.map((link) => (
                    <Link key={link.href} href={link.href}>
                      <Button
                        variant={pathname === link.href ? "secondary" : "ghost"}
                        className="w-full justify-start rounded-lg"
                      >
                        {link.label}
                      </Button>
                    </Link>
                  ))}
                  <hr className="my-2 border-border" />
                  {user ? (
                    <>
                      <Link href="/orders">
                        <Button variant="ghost" className="w-full justify-start rounded-lg">
                          <Package className="mr-2 size-4" />
                          Orders
                        </Button>
                      </Link>
                      <LogoutButton className="w-full justify-start rounded-lg" />
                    </>
                  ) : (
                    <>
                      <Link href="/login">
                        <Button variant="ghost" className="w-full justify-start rounded-lg">
                          Log in
                        </Button>
                      </Link>
                      <Link href="/signup">
                        <Button className="w-full justify-start rounded-lg">
                          Sign up
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </motion.header>
  )
}
