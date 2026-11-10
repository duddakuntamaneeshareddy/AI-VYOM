import { notFound } from "next/navigation"

import { getCurrentUser } from "@/lib/auth/supabase-auth"
import { getProductById, getProductReviews } from "@/lib/db/queries"
import { ProductDetailContent } from "@/components/product/product-detail-content"

interface ProductPageProps {
  params: Promise<{ id: string }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  const [product, user, reviews] = await Promise.all([
    getProductById(id),
    getCurrentUser(),
    getProductReviews(id),
  ])

  if (!product) {
    notFound()
  }

  return (
    <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <ProductDetailContent
          product={product}
          user={user}
          initialReviews={reviews}
        />
      </div>
    </main>
  )
}
