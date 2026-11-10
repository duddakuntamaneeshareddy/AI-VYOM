"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ShoppingBag, Store, Sparkles, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface EntryCardProps {
  href: string
  icon: React.ReactNode
  title: string
  description: string
  accent: "customer" | "retailer"
  delay?: number
}

function EntryCard({ href, icon, title, description, accent, delay = 0 }: EntryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className={cn(
        "surface-bento group relative flex flex-col justify-between overflow-hidden surface-bento-hover",
        accent === "retailer" && "lg:col-span-1"
      )}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/5 blur-3xl transition-opacity group-hover:opacity-80" />

      <div className="relative z-10">
        <div
          className={cn(
            "mb-6 flex size-14 items-center justify-center rounded-2xl",
            accent === "customer"
              ? "bg-primary/10 text-primary"
              : "bg-violet-500/10 text-violet-600 dark:text-violet-400"
          )}
        >
          {icon}
        </div>
        <h2 className="font-heading text-2xl font-bold tracking-tight">{title}</h2>
        <p className="mt-2 max-w-xs text-muted-foreground">{description}</p>
      </div>

      <div className="relative z-10 mt-8">
        <Link href={href}>
          <Button
            className={cn(
              "w-full rounded-full",
              accent === "retailer" &&
                "bg-violet-600 text-white hover:bg-violet-700 dark:bg-violet-600 dark:hover:bg-violet-500"
            )}
          >
            Enter
            <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </Link>
      </div>
    </motion.div>
  )
}

export default function Home() {
  return (
    <main className="relative flex min-h-[calc(100vh-2rem)] flex-col items-center justify-center overflow-hidden px-4 py-16 sm:px-6 lg:px-8">
      {/* Decorative mesh blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[100px]"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
          className="absolute top-1/3 -right-40 h-[460px] w-[460px] rounded-full bg-violet-500/10 blur-[100px]"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
          className="absolute -bottom-40 left-1/3 h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-[100px]"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-1.5 text-sm font-medium text-foreground shadow-sm backdrop-blur"
        >
          <Sparkles className="size-4 text-primary" />
          AI VYOM
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="font-heading text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl"
        >
          <span className="text-gradient">AI VYOM</span><br />
          Shop smarter. Sell simpler.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl"
        >
          Welcome to AI VYOM — where AI-powered shopping meets a premium storefront. Browse as a customer or manage your inventory as a retailer.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="mx-auto mt-12 grid max-w-3xl gap-6 sm:grid-cols-2"
        >
          <EntryCard
            href="/shop"
            icon={<ShoppingBag className="size-7" />}
            title="Browse as Customer"
            description="Discover curated products, get AI recommendations, and shop with voice and chat."
            accent="customer"
            delay={0.4}
          />
          <EntryCard
            href="/retailer"
            icon={<Store className="size-7" />}
            title="Retailer Portal"
            description="Add products, track inventory, and see who ordered your items — all in one place."
            accent="retailer"
            delay={0.5}
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-10 text-sm text-muted-foreground"
        >
          Already have an account? The portal will take you straight to your dashboard.
        </motion.p>
      </div>
    </main>
  )
}
