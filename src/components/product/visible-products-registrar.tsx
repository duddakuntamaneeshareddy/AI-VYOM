"use client"

import * as React from "react"
import { usePageContext } from "@/hooks/use-page-context"


interface VisibleProductsRegistrarProps {
  products: { id: string; name: string }[]
}

export function VisibleProductsRegistrar({ products }: VisibleProductsRegistrarProps) {
  const { setVisibleProducts } = usePageContext()

  React.useEffect(() => {
    setVisibleProducts(products.map((p) => ({ id: p.id, name: p.name })))
    return () => setVisibleProducts([])
  }, [products, setVisibleProducts])

  return null
}
