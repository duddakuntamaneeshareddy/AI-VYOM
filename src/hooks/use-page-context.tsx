"use client"

import * as React from "react"
import type { VisibleProduct } from "@/lib/ai/types"

interface PageContextValue {
  visibleProducts: VisibleProduct[]
  setVisibleProducts: (products: VisibleProduct[]) => void
}

const PageContextContext = React.createContext<PageContextValue | undefined>(undefined)

export function PageContextProvider({ children }: { children: React.ReactNode }) {
  const [visibleProducts, setVisibleProducts] = React.useState<VisibleProduct[]>([])

  return (
    <PageContextContext.Provider value={{ visibleProducts, setVisibleProducts }}>
      {children}
    </PageContextContext.Provider>
  )
}

export function usePageContext() {
  const ctx = React.useContext(PageContextContext)
  if (!ctx) throw new Error("usePageContext must be used within PageContextProvider")
  return ctx
}
