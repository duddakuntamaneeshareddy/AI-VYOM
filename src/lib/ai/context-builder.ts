import {
  getOrdersByUser,
  getProducts,
  getProductById,
  getCartByUser,
} from '@/lib/db/queries'
import type { Product } from '@/lib/db/types'
import type { Intent } from './intent-router'
import type { PageContext } from './types'

export interface ContextResult {
  context: string
  cartItems?: (Awaited<ReturnType<typeof getCartByUser>>)[number][]
  products?: Product[]
}

async function buildCartContext(userId: string) {
  const cart = await getCartByUser(userId)
  if (cart.length === 0) {
    return { text: "\n\nUser's cart is empty.", cart }
  }

  const formatted = cart
    .map((item) => {
      const lineTotal = item.quantity * item.product.price
      return `- ${item.product.name} x${item.quantity} @ $${item.product.price.toFixed(
        2
      )} = $${lineTotal.toFixed(2)}`
    })
    .join('\n')

  return { text: `\n\nUser's current cart:\n${formatted}`, cart }
}

async function buildFullCatalogContext() {
  const products = await getProducts()
  const formatted = products
    .map(
      (product) =>
        `- ${product.name} ($${product.price.toFixed(2)}, ${product.category})`
    )
    .join('\n')

  return { text: `\n\nFull catalog:\n${formatted || 'No products available.'}`, products }
}

function buildPageContextSection(pageContext?: PageContext): string {
  if (!pageContext) return ''

  const productsSection =
    pageContext.visibleProducts.length === 0
      ? '  - No visible products'
      : pageContext.visibleProducts
          .map((p) => `  - ${p.name} (id: ${p.id})`)
          .join('\n')

  return `\n\nCurrent page context:\n- URL: ${pageContext.url}\n- Page type: ${pageContext.pageType}\n- Visible products:\n${productsSection}`
}

export async function buildContext(
  intent: Intent,
  userId: string | null,
  entities: Record<string, string>,
  pageContext?: PageContext
): Promise<ContextResult> {
  const pageContextSection = buildPageContextSection(pageContext)

  switch (intent) {
    case 'order_tracking': {
      if (!userId) {
        return {
          context:
            'User is not logged in. They can sign in to view their recent orders and tracking details.' +
            pageContextSection,
        }
      }

      const [orders, cartContext] = await Promise.all([
        getOrdersByUser(userId),
        buildCartContext(userId),
      ])

      if (orders.length === 0) {
        return {
          context: `The user has no orders on record.${cartContext.text}${pageContextSection}`,
          cartItems: cartContext.cart,
        }
      }

      const formatted = orders
        .map(
          (order) =>
            `- Order ID: ${order.id} | Status: ${order.status} | Total: $${order.total.toFixed(
              2
            )} | Placed: ${new Date(order.created_at).toLocaleDateString()}`
        )
        .join('\n')

      return {
        context: `Recent orders for the user:\n${formatted}${cartContext.text}${pageContextSection}`,
        cartItems: cartContext.cart,
      }
    }

    case 'recommendation': {
      const filters: { category?: string; search?: string } = {}

      if (entities.category) {
        filters.category = entities.category
      }

      if (entities.productName) {
        filters.search = entities.productName
      }

      const [products, allProducts, cartContext] = await Promise.all([
        getProducts(filters),
        getProducts(),
        userId ? buildCartContext(userId) : Promise.resolve({ text: '', cart: [] }),
      ])

      const filteredFormatted = products
        .slice(0, 10)
        .map(
          (product) =>
            `- ${product.name} ($${product.price.toFixed(2)}, ${
              product.category
            }): ${product.description ?? 'No description'} | Stock: ${
              product.stock
            } | Tags: ${product.tags.join(', ') || 'none'}`
        )
        .join('\n')

      const fullCatalogFormatted = allProducts
        .map(
          (product) =>
            `- ${product.name} ($${product.price.toFixed(2)}, ${product.category})`
        )
        .join('\n')

      const baseContext =
        products.length === 0
          ? 'No matching products found in the catalog.'
          : `Available products matching the request:\n${filteredFormatted}`

      return {
        context: `${baseContext}${cartContext.text}\n\nFull catalog:\n${fullCatalogFormatted || 'No products available.'}${pageContextSection}`,
        cartItems: cartContext.cart,
        products: allProducts,
      }
    }

    case 'inventory': {
      const searchTerm = entities.productName || entities.category || ''
      const [products, cartContext] = await Promise.all([
        getProducts(searchTerm ? { search: searchTerm } : {}),
        userId ? buildCartContext(userId) : Promise.resolve({ text: '', cart: [] }),
      ])

      if (products.length === 0) {
        return {
          context: `No matching products found. Ask the user for the exact product name or category.${cartContext.text}${pageContextSection}`,
          cartItems: cartContext.cart,
          products,
        }
      }

      const formatted = products
        .slice(0, 10)
        .map(
          (product) =>
            `- ${product.name} (${product.category}): ${
              product.stock > 0
                ? `${product.stock} in stock`
                : 'Out of stock'
            }`
        )
        .join('\n')

      return {
        context: `Stock information:\n${formatted}${cartContext.text}${pageContextSection}`,
        cartItems: cartContext.cart,
        products,
      }
    }

    case 'return_refund': {
      if (!userId) {
        return {
          context:
            'User is not logged in. They can sign in to view their orders and initiate a return.' +
            pageContextSection,
        }
      }

      const [orders, cartContext] = await Promise.all([
        getOrdersByUser(userId),
        buildCartContext(userId),
      ])

      const formatted = orders
        .slice(0, 5)
        .map(
          (order) =>
            `- Order ID: ${order.id} | Status: ${order.status} | Total: $${order.total.toFixed(
              2
            )}`
        )
        .join('\n')

      return {
        context: `User's recent orders (eligible for return review):\n${formatted || 'No orders on record.'}${cartContext.text}${pageContextSection}`,
        cartItems: cartContext.cart,
      }
    }

    case 'cart': {
      if (!userId) {
        return {
          context:
            'User is not logged in. They can sign in to view and manage their cart.' +
            pageContextSection,
        }
      }

      const cartContext = await buildCartContext(userId)
      return {
        context: cartContext.text.replace(/^\n+/, '') + pageContextSection,
        cartItems: cartContext.cart,
      }
    }

    case 'general':
    default: {
      if (!userId) {
        return {
          context:
            'The user is not logged in. Provide general shopping assistance.' +
            pageContextSection,
        }
      }

      const [cartContext, fullCatalogContext] = await Promise.all([
        buildCartContext(userId),
        buildFullCatalogContext(),
      ])

      return {
        context: `The user is logged in. Provide helpful shopping assistance.${cartContext.text}${fullCatalogContext.text}${pageContextSection}`,
        cartItems: cartContext.cart,
        products: fullCatalogContext.products,
      }
    }
  }
}

export async function buildProductContext(productId: string): Promise<string> {
  const product = await getProductById(productId)
  if (!product) {
    return 'Product not found.'
  }

  return `Current product:\n- ${product.name} ($${product.price.toFixed(2)}, ${
    product.category
  })\n- ${product.description ?? 'No description'}\n- Stock: ${
    product.stock
  }\n- Tags: ${product.tags.join(', ') || 'none'}`
}
