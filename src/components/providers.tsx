"use client"

import * as React from "react"
import { CartProvider } from "@/hooks/use-cart"
import { PageContextProvider } from "@/hooks/use-page-context"
import { FlyToCartProvider } from "@/components/cart/fly-to-cart"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PageContextProvider>
      <FlyToCartProvider>
        <CartProvider>{children}</CartProvider>
      </FlyToCartProvider>
    </PageContextProvider>
  )
}
