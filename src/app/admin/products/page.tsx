import { redirect } from "next/navigation"

import { requireAdmin } from "@/lib/auth/supabase-auth"
import { getProducts, getCategories } from "@/lib/db/queries"
import { ProductsTable } from "@/components/admin/products-table"
import { CreateProductDialog } from "@/components/admin/create-product-dialog"

export default async function ProductsAdminPage() {
  try {
    await requireAdmin()
  } catch {
    redirect("/login")
  }

  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">
            Manage inventory, pricing, and product details.
          </p>
        </div>
        <CreateProductDialog categories={categories} />
      </div>
      <ProductsTable products={products} categories={categories} />
    </div>
  )
}
