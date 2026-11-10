import Link from "next/link"
import { ScrollReveal } from "@/components/ui/scroll-reveal"

export function Footer() {
  return (
    <ScrollReveal direction="up">
      <footer className="glass-card mx-4 mb-6 mt-auto rounded-2xl px-6 py-8 sm:mx-6 lg:mx-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="font-heading text-lg font-bold">
              <span className="text-primary">AI</span> VYOM
            </span>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            <Link href="/products" className="hover:text-foreground">
              Products
            </Link>
            <Link href="/orders" className="hover:text-foreground">
              Orders
            </Link>
          </nav>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} AI VYOM. All rights reserved.
          </p>
        </div>
      </footer>
    </ScrollReveal>
  )
}
