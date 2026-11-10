import { Suspense } from "react"
import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ProductGrid } from "@/components/product/product-grid"
import { ProductCardSkeleton } from "@/components/ui/skeleton-card"
import { VisibleProductsRegistrar } from "@/components/product/visible-products-registrar"
import { ScrollReveal } from "@/components/ui/scroll-reveal"
import { getProducts, getCategories } from "@/lib/db/queries"

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

async function FeaturedProducts() {
  const products = await getProducts({ sort: "newest" })
  return (
    <>
      <VisibleProductsRegistrar products={products} />
      <ProductGrid products={products} />
    </>
  )
}

export default async function ShopPage() {
  const categories = await getCategories()

  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-20 right-0 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />
        </div>

        <div className="mx-auto max-w-5xl text-center">
          <ScrollReveal direction="up">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-1.5 text-sm font-medium shadow-sm backdrop-blur">
              <Sparkles className="size-4 text-primary" />
              Curated for you
            </div>
            <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Your AI storefront
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
              Explore products, ask the AI assistant for recommendations, and shop effortlessly.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/products">
                <Button size="lg" className="rounded-full">
                  Browse full catalog
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Categories */}
      <section className="px-4 pb-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal direction="up" className="mb-6">
            <h2 className="font-heading text-xl font-semibold">Shop by category</h2>
          </ScrollReveal>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <Link
                key={category}
                href={`/products?category=${encodeURIComponent(category)}`}
                className="rounded-full border border-border bg-card/80 px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:border-primary/30 hover:bg-primary/5"
              >
                {category}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Product grid */}
      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal direction="up" className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="font-heading text-3xl font-bold">Featured Products</h2>
              <p className="mt-2 text-muted-foreground">Fresh arrivals and AI-picked highlights.</p>
            </div>
            <Link href="/products" className="hidden sm:block">
              <Button variant="outline" className="rounded-full">
                View all
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </Link>
          </ScrollReveal>

          <Suspense fallback={<ProductGridSkeleton />}>
            <FeaturedProducts />
          </Suspense>
        </div>
      </section>
    </main>
  )
}
