import { Suspense } from "react"
import Link from "next/link"
import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ProductCardSkeleton } from "@/components/ui/skeleton-card"
import { ProductGrid } from "@/components/product/product-grid"
import { VisibleProductsRegistrar } from "@/components/product/visible-products-registrar"
import { getProducts, getCategories } from "@/lib/db/queries"

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string
    search?: string
    sort?: string
  }>
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

async function ProductResults({
  category,
  search,
  sort,
}: {
  category?: string
  search?: string
  sort?: string
}) {
  const products = await getProducts({ category, search, sort })
  return (
    <>
      <VisibleProductsRegistrar products={products} />
      <ProductGrid products={products} />
    </>
  )
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams
  const category = params.category
  const search = params.search
  const sort = params.sort || "newest"

  const categories = await getCategories()

  return (
    <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="font-heading text-4xl font-bold">Products</h1>
          <p className="mt-2 text-muted-foreground">
            Discover our curated collection powered by AI recommendations.
          </p>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          <aside className="w-full lg:w-64 lg:shrink-0">
            <div className="surface-bento sticky top-28 space-y-6">
              <div>
                <Label htmlFor="search" className="mb-2 block">
                  Search
                </Label>
                <form action="/products" method="GET" className="relative">
                  <Input
                    id="search"
                    name="search"
                    placeholder="Search products..."
                    defaultValue={search}
                    className="pr-9"
                  />
                  <Search className="absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input type="hidden" name="category" value={category} />
                  <input type="hidden" name="sort" value={sort} />
                </form>
              </div>

              <div>
                <Label className="mb-2 block">Category</Label>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/products?sort=${sort}${search ? `&search=${search}` : ""}`}>
                    <Badge
                      variant={!category || category === "all" ? "default" : "outline"}
                      className="cursor-pointer"
                    >
                      All
                    </Badge>
                  </Link>
                  {categories.map((cat) => (
                    <Link
                      key={cat}
                      href={`/products?category=${encodeURIComponent(cat)}&sort=${sort}${
                        search ? `&search=${search}` : ""
                      }`}
                    >
                      <Badge
                        variant={category === cat ? "default" : "outline"}
                        className="cursor-pointer"
                      >
                        {cat}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="sort" className="mb-2 block">
                  Sort by
                </Label>
              <form action="/products" method="GET" id="sort-form">
                <Select name="sort" defaultValue={sort}>
                  <SelectTrigger id="sort" className="w-full">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price_asc">Price: Low to High</SelectItem>
                    <SelectItem value="price_desc">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
                <input type="hidden" name="category" value={category} />
                <input type="hidden" name="search" value={search} />
                <noscript>
                  <Button type="submit" variant="outline" size="sm" className="mt-3 w-full rounded-full">
                    Apply Sort
                  </Button>
                </noscript>
              </form>
              <script dangerouslySetInnerHTML={{ __html: `document.getElementById('sort-form')?.querySelector('select[name="sort"]')?.addEventListener('change',function(){document.getElementById('sort-form').submit();})` }} />
              </div>
            </div>
          </aside>

          <section className="flex-1">
            <Suspense fallback={<ProductGridSkeleton />}>
              <ProductResults category={category} search={search} sort={sort} />
            </Suspense>
          </section>
        </div>
      </div>
    </main>
  )
}
