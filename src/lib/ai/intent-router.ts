export type Intent =
  | 'general'
  | 'order_tracking'
  | 'recommendation'
  | 'inventory'
  | 'return_refund'
  | 'cart'

interface WeightedKeyword {
  keyword: string
  weight: number
}

const INTENT_KEYWORDS: Record<Intent, WeightedKeyword[]> = {
  order_tracking: [
    { keyword: 'my order', weight: 3 },
    { keyword: 'order status', weight: 3 },
    { keyword: 'order id', weight: 3 },
    { keyword: 'where is my', weight: 3 },
    { keyword: 'track', weight: 2 },
    { keyword: 'shipment', weight: 2 },
    { keyword: 'shipping', weight: 2 },
    { keyword: 'delivered', weight: 2 },
    { keyword: 'status of', weight: 2 },
    { keyword: 'package', weight: 1 },
    { keyword: 'order', weight: 1 },
  ],
  recommendation: [
    { keyword: 'recommend', weight: 3 },
    { keyword: 'suggest', weight: 3 },
    { keyword: 'what should i', weight: 3 },
    { keyword: 'looking for', weight: 2 },
    { keyword: 'show me', weight: 2 },
    { keyword: 'similar to', weight: 2 },
    { keyword: 'like this', weight: 2 },
    { keyword: 'gift', weight: 2 },
    { keyword: 'best', weight: 1 },
  ],
  inventory: [
    { keyword: 'in stock', weight: 3 },
    { keyword: 'how many', weight: 3 },
    { keyword: 'availability', weight: 3 },
    { keyword: 'is it available', weight: 3 },
    { keyword: 'stock', weight: 2 },
    { keyword: 'available', weight: 2 },
    { keyword: 'restock', weight: 2 },
    { keyword: 'inventory', weight: 2 },
    { keyword: 'left', weight: 1 },
  ],
  return_refund: [
    { keyword: 'send back', weight: 3 },
    { keyword: 'money back', weight: 3 },
    { keyword: 'wrong item', weight: 3 },
    { keyword: 'return', weight: 2 },
    { keyword: 'refund', weight: 2 },
    { keyword: 'exchange', weight: 2 },
    { keyword: 'defective', weight: 2 },
    { keyword: 'damaged', weight: 2 },
  ],
  cart: [
    { keyword: 'my cart', weight: 3 },
    { keyword: 'in my cart', weight: 3 },
    { keyword: 'shopping bag', weight: 3 },
    { keyword: 'remove from cart', weight: 3 },
    { keyword: 'clear cart', weight: 3 },
    { keyword: 'what did i add', weight: 3 },
    { keyword: 'in my bag', weight: 3 },
    { keyword: 'checkout', weight: 2 },
    { keyword: 'added to cart', weight: 2 },
    { keyword: 'take out', weight: 2 },
    { keyword: 'cart', weight: 1 },
    { keyword: 'remove', weight: 1 },
    { keyword: 'added', weight: 1 },
  ],
  general: [],
}

export function detectIntent(userMessage: string): Intent {
  const lower = userMessage.toLowerCase()

  const scores: { intent: Intent; score: number }[] = (
    Object.entries(INTENT_KEYWORDS) as [Intent, WeightedKeyword[]][]
  ).map(([intent, keywords]) => ({
    intent,
    score: keywords.reduce(
      (total, { keyword, weight }) =>
        lower.includes(keyword) ? total + weight : total,
      0
    ),
  }))

  const best = scores.reduce((max, current) =>
    current.score > max.score ? current : max
  )

  return best.score > 0 ? best.intent : 'general'
}

export function extractEntities(message: string): Record<string, string> {
  const entities: Record<string, string> = {}
  const lower = message.toLowerCase()

  // Order IDs: UUIDs
  const uuidMatch = message.match(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
  )
  if (uuidMatch) {
    entities.orderId = uuidMatch[0]
  }

  // Product names: quoted strings are strong signals
  const quotedMatch = message.match(/"([^"]+)"/)
  if (quotedMatch) {
    entities.productName = quotedMatch[1]
  }

  // Category hints
  const categoryKeywords = ['electronics', 'fashion', 'home', 'sports', 'books', 'beauty', 'toys', 'gadgets']
  for (const category of categoryKeywords) {
    if (lower.includes(category)) {
      entities.category = category
      break
    }
  }

  // Budget hints — requires explicit currency signal to avoid false positives
  // e.g. "$100", "100 dollars", "under 50 usd", "around $200"
  const budgetMatch = message.match(
    /(?:under|below|around|about|less\s+than|max|within)\s*\$?\s*(\d+)\s*(?:dollars?|usd|bucks?)?/i
  ) ?? message.match(/\$\s*(\d+)/)
  if (budgetMatch) {
    entities.budget = budgetMatch[1]
  }

  return entities
}
