import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Plus, AlertTriangle, Package } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { requireRetailer } from "@/lib/auth/supabase-auth"
import { getProductsByRetailer } from "@/lib/db/queries"
import { cn, formatPrice } from "@/lib/utils"
import { DeleteProductButton } from "@/components/retailer/delete-product-button"

const LOW_STOCK_THRESHOLD = 5

export default async function RetailerProductsPage() {
  let retailer
  try {
    retailer = await requireRetailer()
  } catch {
    redirect("/login")
  }

  const products = await getProductsByRetailer(retailer.id)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Products</h1>
          <p className="text-muted-foreground">Manage inventory and edit listings.</p>
        </div>
        <Link
          href="/retailer/products/new"
          className={cn(buttonVariants({}), "rounded-full")}
        >
          <Plus className="mr-2 size-4" />
          Add Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="surface-bento flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted">
            <Package className="size-7 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium">No products yet</p>
          <p className="text-sm text-muted-foreground">
            Add your first product to start selling.
          </p>
          <Link href="/retailer/products/new" className={cn(buttonVariants({}), "mt-4 rounded-full")}>
            Add Product
          </Link>
        </div>
      ) : (
        <div className="surface-bento overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Stock</th>
                  <th className="px-4 py-3 font-medium">Tags</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative size-12 overflow-hidden rounded-lg bg-muted">
                          {product.image_url ? (
                            <Image
                              src={product.image_url}
                              alt={product.name}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-muted-foreground">
                              <Package className="size-5" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="max-w-[200px] truncate text-xs text-muted-foreground">
                            {product.description ?? "No description"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">{product.category}</Badge>
                    </td>
                    <td className="px-4 py-3 font-medium">{formatPrice(product.price)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            product.stock <= LOW_STOCK_THRESHOLD && "text-amber-600 dark:text-amber-400"
                          )}
                        >
                          {product.stock}
                        </span>
                        {product.stock <= LOW_STOCK_THRESHOLD && (
                          <AlertTriangle className="size-4 text-amber-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {product.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-[10px]">
                            {tag}
                          </Badge>
                        ))}
                        {product.tags.length > 3 && (
                          <Badge variant="secondary" className="text-[10px]">
                            +{product.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DeleteProductButton
                        productId={product.id}
                        productName={product.name}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
