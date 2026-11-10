"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Save, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { cn, formatPrice } from "@/lib/utils"
import type { Product } from "@/lib/db/types"

interface ProductsTableProps {
  products: Product[]
  categories: string[]
}

export function ProductsTable({ products, categories }: ProductsTableProps) {
  const router = useRouter()
  const [search, setSearch] = React.useState("")
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all")
  const [edits, setEdits] = React.useState<Record<string, string>>({})
  const [savingId, setSavingId] = React.useState<string | null>(null)

  const filtered = React.useMemo(() => {
    return products.filter((product) => {
      const term = search.toLowerCase()
      const matchesSearch =
        product.name.toLowerCase().includes(term) ||
        product.tags.some((tag) => tag.toLowerCase().includes(term))
      const matchesCategory =
        categoryFilter === "all" || product.category === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [products, search, categoryFilter])

  function getStockValue(productId: string, currentStock: number) {
    return edits[productId] ?? String(currentStock)
  }

  async function saveStock(productId: string, currentStock: number) {
    const stock = Number(getStockValue(productId, currentStock))
    if (Number.isNaN(stock) || stock < 0) {
      toast.error("Invalid stock value")
      return
    }

    setSavingId(productId)
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock }),
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error ?? "Failed to update stock")
      }
      toast.success("Stock updated")
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed")
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={(value) => value && setCategoryFilter(value)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left">
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Tags</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <AnimatePresence>
              {filtered.map((product, index) => {
                const outOfStock = product.stock === 0
                return (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ delay: index * 0.03, duration: 0.2 }}
                    className={cn(
                      "transition-colors hover:bg-muted/40",
                      outOfStock && "bg-rose-500/5"
                    )}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium">{product.name}</p>
                      {outOfStock && (
                        <Badge variant="destructive" className="mt-1 text-[10px]">
                          Out of stock
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{product.category}</td>
                    <td className="px-4 py-3 font-medium">{formatPrice(product.price)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={0}
                          value={getStockValue(product.id, product.stock)}
                          onChange={(e) =>
                            setEdits((prev) => ({
                              ...prev,
                              [product.id]: e.target.value,
                            }))
                          }
                          className="h-7 w-20 text-right text-xs"
                        />
                        <Button
                          size="icon-xs"
                          variant="ghost"
                          onClick={() => saveStock(product.id, product.stock)}
                          disabled={savingId === product.id}
                          aria-label="Save stock"
                        >
                          {savingId === product.id ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Save className="size-3.5" />
                          )}
                        </Button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {product.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-[10px]">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                          outOfStock
                            ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        )}
                      >
                        {outOfStock ? "Out of stock" : "In stock"}
                      </span>
                    </td>
                  </motion.tr>
                )
              })}
            </AnimatePresence>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
