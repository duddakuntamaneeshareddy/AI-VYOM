export type ActionType =
  | 'navigate_to'
  | 'list_products'
  | 'open_product'
  | 'open_cart'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'clear_cart'

export interface Action {
  type: ActionType
  // path for navigate_to/list_products/open_product
  path?: string
  // productId for open_product / add_to_cart
  productId?: string
  // itemId for remove_from_cart (cart item id, not product id)
  itemId?: string
  // category for list_products
  category?: string
}

export interface VisibleProduct {
  id: string
  name: string
}

export interface PageContext {
  url: string
  pageType: 'home' | 'product-list' | 'product-detail' | 'cart' | 'orders' | 'returns' | 'admin' | 'other'
  visibleProducts: VisibleProduct[]
}

export interface ActionResult {
  actions: Action[]
}
