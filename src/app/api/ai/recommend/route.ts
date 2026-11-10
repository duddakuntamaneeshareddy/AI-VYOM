import { NextRequest, NextResponse } from 'next/server'

import { aiProvider } from '@/lib/ai'
import { getProductById, getProducts } from '@/lib/db/queries'
import type { Product } from '@/lib/db/types'

interface RecommendRequestBody {
  productId: string
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RecommendRequestBody
    const { productId } = body

    if (!productId || typeof productId !== 'string') {
      return NextResponse.json(
        { error: 'productId is required' },
        { status: 400 }
      )
    }

    const product = await getProductById(productId)

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    const allProducts = await getProducts()

    const similarProducts = allProducts
      .filter((p) => p.id !== product.id)
      .map((p) => ({
        product: p,
        score: computeSimilarity(product, p),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map((item) => item.product)

    let message = ''
    if (similarProducts.length > 0) {
      const context = `Current product: ${product.name} ($${product.price.toFixed(
        2
      )}, ${product.category}). Similar products: ${similarProducts
        .map((p) => `${p.name} ($${p.price.toFixed(2)}, ${p.category})`)
        .join('; ')}.`

      const prompt = `You are a friendly shopping assistant. Write a short, engaging product recommendation message (2-3 sentences) for someone viewing the current product. Mention why the similar products are good alternatives or complements. Keep it concise and warm.\n\n${context}`

      message = await aiProvider.chat(
        [
          {
            role: 'system',
            content:
              'You write concise, friendly e-commerce recommendation messages.',
          },
          { role: 'user', content: prompt },
        ],
        { temperature: 0.7, maxTokens: 256 }
      )
    } else {
      message = `We couldn't find any similar products to ${product.name}, but check back soon for new arrivals.`
    }

    return NextResponse.json({
      recommendations: similarProducts,
      message,
    })
  } catch (error) {
    console.error('AI recommend error:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate recommendations',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

function computeSimilarity(a: Product, b: Product): number {
  let score = 0

  if (a.category === b.category) {
    score += 3
  }

  const sharedTags = a.tags.filter((tag) => b.tags.includes(tag))
  score += sharedTags.length * 2

  const priceDiff = Math.abs(a.price - b.price)
  if (priceDiff < a.price * 0.2) {
    score += 1
  }

  return score
}
