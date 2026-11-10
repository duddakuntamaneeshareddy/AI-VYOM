import type { Action, PageContext } from './types'
import type { Intent } from './intent-router'

const STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'from', 'this', 'that', 'into', 'onto',
  'about', 'over', 'under', 'after', 'before', 'during', 'within', 'without',
  'through', 'between', 'against', 'among', 'around', 'behind', 'below',
  'beside', 'beyond', 'inside', 'outside', 'until', 'upon', 'toward',
  'towards', 'across', 'along', 'above', 'near', 'off', 'past', 'plus',
  'minus', 'since', 'than', 'till', 'via', 'worth',
])

function normalize(text: string): string {
  return text.toLowerCase().trim()
}

function tokenize(text: string): string[] {
  return text.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length > 0)
}

function extractDistinctiveKeywords(name: string): string[] {
  return tokenize(name).filter((t) => t.length >= 4 && !STOPWORDS.has(t))
}

interface ProductLike {
  id: string
  name: string
}

function findProductByName(
  message: string,
  products?: ProductLike[]
): ProductLike | null {
  if (!products || products.length === 0) return null
  const lower = normalize(message)

  // Full name match first
  for (const product of products) {
    if (lower.includes(normalize(product.name))) return product
  }

  // Distinctive keyword fallback
  for (const product of products) {
    const keywords = extractDistinctiveKeywords(product.name)
    for (const keyword of keywords) {
      if (lower.includes(keyword)) return product
    }
  }

  return null
}

function findProductByOrdinal(
  message: string,
  products?: ProductLike[]
): ProductLike | null {
  if (!products || products.length === 0) return null
  const lower = normalize(message)

  const ordinalPatterns: { regex: RegExp; index: number }[] = [
    { regex: /\b(first|1st)\b/i, index: 0 },
    { regex: /\b(second|2nd)\b/i, index: 1 },
    { regex: /\b(third|3rd)\b/i, index: 2 },
    { regex: /\b(fourth|4th)\b/i, index: 3 },
    { regex: /\b(fifth|5th)\b/i, index: 4 },
    { regex: /\b(sixth|6th)\b/i, index: 5 },
    { regex: /\b(seventh|7th)\b/i, index: 6 },
    { regex: /\b(eighth|8th)\b/i, index: 7 },
    { regex: /\b(ninth|9th)\b/i, index: 8 },
    { regex: /\b(tenth|10th)\b/i, index: 9 },
    { regex: /\blast\b/i, index: products.length - 1 },
  ]

  for (const { regex, index } of ordinalPatterns) {
    if (regex.test(lower) && index >= 0 && index < products.length) {
      return products[index]
    }
  }

  return null
}

function findProduct(
  message: string,
  products?: ProductLike[],
  visibleProducts?: ProductLike[]
): ProductLike | null {
  return (
    findProductByName(message, visibleProducts) ??
    findProductByName(message, products) ??
    findProductByOrdinal(message, visibleProducts)
  )
}

function findCategory(
  message: string,
  products?: { id: string; name: string; category: string }[]
): string | null {
  const lower = normalize(message)

  if (products && products.length > 0) {
    const categories = Array.from(new Set(products.map((p) => p.category)))
    for (const category of categories) {
      if (lower.includes(category.toLowerCase())) return category
    }
  }

  const fallback = ['electronics', 'fashion', 'home', 'sports', 'books', 'beauty', 'toys', 'gadgets']
  for (const category of fallback) {
    if (lower.includes(category)) return category
  }

  return null
}

function hasOpenCartIntent(message: string): boolean {
  return /\b(open|show|view)\b.*\b(cart|bag)\b|\bmy\s+(cart|bag)\b/i.test(message)
}

function hasClearCartIntent(message: string): boolean {
  return /\b(clear|empty|wipe)\b.*\b(cart|bag)\b/i.test(message)
}

/**
 * Matches both typed and voice-natural add-to-cart phrases.
 * Covers: "add to cart", "add the basketball" (no cart word needed),
 * "buy this", "purchase the laptop", "get me the speaker",
 * "I'll take it", "I want this", "add it to my car" (voice STT for "cart")
 */
function hasAddToCartIntent(message: string): boolean {
  return (
    // Explicit cart/bag/car (voice STT typo) reference
    /\badd\b.*\b(cart|bag|car)\b|\bput\b.*\b(cart|bag|car)\b|\badd\s+to\s+(?:my\s+)?(?:cart|bag|car)\b/i.test(message) ||
    // Plain "add" verb — product-match in resolveActions acts as guard
    /^\s*(?:can\s+you\s+|please\s+)?add\b/i.test(message) ||
    // Voice-natural purchase phrases
    /\b(buy|purchase|grab)\b/i.test(message) ||
    /\bget\s+me\b/i.test(message) ||
    /\bi(?:'ll|\s+will)\s+take\b/i.test(message) ||
    /\bi\s+want\s+to\s+buy\b/i.test(message) ||
    /\bi\s+want\s+(this|that|it|one)\b/i.test(message)
  )
}

/**
 * Matches remove-from-cart phrases. Requires cart/bag context OR explicit
 * pronoun + remove verb to avoid false positives on unrelated "delete" mentions.
 */
function hasRemoveFromCartIntent(message: string): boolean {
  return (
    // Explicit cart/bag reference
    /\b(remove|delete|take\s+out|drop)\b.*\b(cart|bag|from\s+(?:my\s+)?(?:cart|bag))\b/i.test(message) ||
    // Vague pronoun with remove verb: "remove this", "delete it", "take that out"
    /\b(remove|delete|take\s+out)\b.*\b(this|that|it|item)\b/i.test(message)
  )
}

function hasOpenProductIntent(message: string): boolean {
  return /open|show|tell me about|view|i like|details of/i.test(message)
}

function hasListProductsIntent(message: string): boolean {
  return /\b(show|see|find|search)\b/i.test(message)
}

function buildNavigateToActions(message: string, matchedProduct: boolean): Action[] {
  const lower = normalize(message)

  if (/order|my order|orders/.test(lower)) return [{ type: 'navigate_to', path: '/orders' }]
  if (/return|refund/.test(lower)) return [{ type: 'navigate_to', path: '/returns' }]
  if (/product|catalog|shop|browse/.test(lower) && !matchedProduct) return [{ type: 'navigate_to', path: '/products' }]
  if (/home|homepage|main/.test(lower)) return [{ type: 'navigate_to', path: '/' }]

  return []
}

export function resolveActions(params: {
  userMessage: string
  aiResponse: string
  intent: Intent
  context: string
  pageContext?: PageContext
  cartItems?: { id: string; product_id: string; product: { name: string } }[]
  products?: { id: string; name: string; category: string }[]
}): Action[] {
  const { userMessage, intent, cartItems, products, pageContext } = params

  // 1. open_cart
  if (hasOpenCartIntent(userMessage)) {
    return [{ type: 'open_cart' }]
  }

  // 2. clear_cart
  if (hasClearCartIntent(userMessage)) {
    return [{ type: 'clear_cart' }]
  }

  // 3. add_to_cart — from user message
  if (hasAddToCartIntent(userMessage)) {
    let product = findProduct(userMessage, products, pageContext?.visibleProducts)

    // Fallback: exactly 1 visible product on screen — assume they mean it
    if (!product && pageContext?.visibleProducts?.length === 1) {
      product = pageContext.visibleProducts[0]
    }

    if (product) {
      return [{ type: 'add_to_cart', productId: product.id }]
    }
  }

  // 3b. add_to_cart — AI response fallback
  // If user phrasing was ambiguous but AI confirmed "adding X to cart", trust it.
  if (/\b(adding|added)\b.*\b(cart|bag)\b/i.test(params.aiResponse)) {
    const product = findProduct(userMessage, products, pageContext?.visibleProducts)
    if (product) {
      return [{ type: 'add_to_cart', productId: product.id }]
    }
  }

  // 4. remove_from_cart
  if (hasRemoveFromCartIntent(userMessage)) {
    let product = findProduct(userMessage, products, pageContext?.visibleProducts)

    // Fallback 1: ordinals against cart items ("remove the first one")
    if (!product && cartItems && cartItems.length > 0) {
      const cartAsProducts: ProductLike[] = cartItems.map((c) => ({
        id: c.product_id,
        name: c.product.name,
      }))
      product = findProductByOrdinal(userMessage, cartAsProducts)
    }

    // Fallback 2: exactly 1 cart item + vague pronoun → assume they mean it
    if (
      !product &&
      cartItems?.length === 1 &&
      /\b(it|this|that|item|one)\b/i.test(userMessage)
    ) {
      product = { id: cartItems[0].product_id, name: cartItems[0].product.name }
    }

    if (product && cartItems && cartItems.length > 0) {
      const cartItem = cartItems.find(
        (item) =>
          item.product_id === product!.id ||
          normalize(item.product.name).includes(normalize(product!.name)) ||
          normalize(product!.name).includes(normalize(item.product.name))
      )
      if (cartItem) {
        return [{ type: 'remove_from_cart', itemId: cartItem.id }]
      }
    }
  }

  // 5. open_product
  if (hasOpenProductIntent(userMessage)) {
    const product = findProduct(userMessage, products, pageContext?.visibleProducts)
    if (product) {
      return [{ type: 'open_product', productId: product.id, path: `/products/${product.id}` }]
    }
  }

  // 6. list_products
  if (intent === 'recommendation' && hasListProductsIntent(userMessage)) {
    const category = findCategory(userMessage, products)
    if (category) {
      return [{
        type: 'list_products',
        category,
        path: `/products?category=${encodeURIComponent(category)}`,
      }]
    }
  }

  // 7. navigate_to
  const matchedProduct = findProduct(userMessage, products, pageContext?.visibleProducts) !== null
  const navigateActions = buildNavigateToActions(userMessage, matchedProduct)
  if (navigateActions.length > 0) return navigateActions

  return []
}
