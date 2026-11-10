"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { createClient } from "@/lib/db/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ShoppingBag, Store, Check } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type Role = "customer" | "retailer"

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<Role>("customer")
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })

    if (error) {
      setIsLoading(false)
      toast.error(error.message)
      return
    }

    // If a session was created immediately (email confirmation disabled),
    // persist the selected role server-side because the DB trigger ignores it.
    if (data.session) {
      try {
        const roleRes = await fetch("/api/profile/role", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role }),
        })
        if (!roleRes.ok) {
          const err = await roleRes.json()
          console.error("Failed to persist role:", err)
        }
      } catch (err) {
        console.error("Role update request failed:", err)
      }
    }

    setIsLoading(false)

    toast.success("Account created. Welcome to AI VYOM!")

    if (data.session) {
      router.push(role === "retailer" ? "/retailer" : "/shop")
    } else {
      router.push("/login")
    }
    router.refresh()
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="glass-card w-full max-w-md space-y-6 p-8"
      >
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Create an account</h1>
          <p className="text-sm text-muted-foreground">
            Start your <span className="text-gradient font-semibold">AI</span>-powered shopping journey.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              placeholder="Jane Doe"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>I want to</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("customer")}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-2xl border bg-card/60 p-4 text-left transition-all hover:bg-card",
                  role === "customer"
                    ? "border-primary bg-primary/5 text-primary ring-1 ring-primary"
                    : "border-border"
                )}
              >
                <div
                  className={cn(
                    "flex size-10 items-center justify-center rounded-xl",
                    role === "customer" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}
                >
                  <ShoppingBag className="size-5" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold">Customer</p>
                  <p className="text-[10px] text-muted-foreground">Shop products</p>
                </div>
                {role === "customer" && (
                  <div className="absolute right-2 top-2">
                    <Check className="size-4 text-primary" />
                  </div>
                )}
              </button>

              <button
                type="button"
                onClick={() => setRole("retailer")}
                className={cn(
                  "relative flex flex-col items-center gap-2 rounded-2xl border bg-card/60 p-4 text-left transition-all hover:bg-card",
                  role === "retailer"
                    ? "border-violet-500 bg-violet-500/5 text-violet-600 ring-1 ring-violet-500 dark:text-violet-400"
                    : "border-border"
                )}
              >
                <div
                  className={cn(
                    "flex size-10 items-center justify-center rounded-xl",
                    role === "retailer"
                      ? "bg-violet-500 text-white"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <Store className="size-5" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold">Retailer</p>
                  <p className="text-[10px] text-muted-foreground">Sell products</p>
                </div>
                {role === "retailer" && (
                  <div className="absolute right-2 top-2">
                    <Check className="size-4 text-violet-500" />
                  </div>
                )}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full rounded-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Sign Up"
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </main>
  )
}
