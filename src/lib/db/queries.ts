import { createServerSupabaseClient } from "@/lib/db/supabase-server"
import type { Product, ProductReview, CartItem, Order, OrderItem, Profile, Return, ReturnStatus, Notification, Campaign, CampaignSegment, EmailTemplate } from "@/lib/db/types"

export async function getProducts(filters?: {
  category?: string
  search?: string
  sort?: string
}): Promise<Product[]> {
  const supabase = await createServerSupabaseClient()
  let query = supabase.from("products").select("*")

  if (filters?.category && filters.category !== "all") {
    query = query.eq("category", filters.category)
  }

  if (filters?.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,tags.cs.{${filters.search}}`
    )
  }

  switch (filters?.sort) {
    case "price_asc":
      query = query.order("price", { ascending: true })
      break
    case "price_desc":
      query = query.order("price", { ascending: false })
      break
    case "newest":
      query = query.order("created_at", { ascending: false })
      break
    default:
      query = query.order("created_at", { ascending: false })
  }

  const { data, error } = await query

  if (error) {
    console.error("getProducts error:", error)
    return []
  }

  return (data ?? []) as Product[]
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !data) {
    console.error("getProductById error:", error)
    return null
  }

  return data as Product
}

export async function getProductReviews(productId: string): Promise<ProductReview[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from("product_reviews")
    .select("*, profiles:profiles(full_name, email)")
    .eq("product_id", productId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("getProductReviews error:", error)
    return []
  }

  return (data ?? []) as ProductReview[]
}

export async function addProductReview(data: {
  productId: string
  userId: string
  rating: number
  comment: string
}): Promise<ProductReview> {
  const supabase = await createServerSupabaseClient()
  const { data: review, error } = await supabase
    .from("product_reviews")
    .insert({
      product_id: data.productId,
      user_id: data.userId,
      rating: data.rating,
      comment: data.comment,
    })
    .select("*")
    .single()

  if (error || !review) {
    console.error("addProductReview error:", error)
    throw new Error(error?.message ?? "Failed to add review")
  }

  return review as ProductReview
}

export async function getProductsByRetailer(retailerId: string): Promise<Product[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("retailer_id", retailerId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("getProductsByRetailer error:", error)
    return []
  }

  return (data ?? []) as Product[]
}

export async function getRetailerOrders(retailerId: string): Promise<
  { order: Order; customer: Profile; items: (OrderItem & { product: Product })[] }[]
> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from("order_items")
    .select("*, product:products(*), order:orders(*, customer:profiles(*))")
    .eq("products.retailer_id", retailerId)
    .order("created_at", { foreignTable: "orders", ascending: false })

  if (error) {
    console.error("getRetailerOrders error:", error)
    return []
  }

  const rows = (data ?? []) as unknown as (OrderItem & {
    product: Product
    order: Order & { customer: Profile }
  })[]

  const byOrder = new Map<string, { order: Order; customer: Profile; items: (OrderItem & { product: Product })[] }>()

  for (const row of rows) {
    const { order, ...item } = row
    const existing = byOrder.get(order.id)
    if (existing) {
      existing.items.push(item as OrderItem & { product: Product })
    } else {
      byOrder.set(order.id, {
        order: order as Order,
        customer: order.customer,
        items: [item as OrderItem & { product: Product }],
      })
    }
  }

  return Array.from(byOrder.values())
}

export async function createRetailerProduct(data: {
  retailerId: string
  name: string
  price: number
  category: string
  image_url?: string | null
  stock?: number
  tags?: string[]
  description?: string | null
  specifications?: Record<string, string> | null
}): Promise<Product> {
  const supabase = await createServerSupabaseClient()
  const { data: product, error } = await supabase
    .from("products")
    .insert({
      retailer_id: data.retailerId,
      name: data.name,
      price: data.price,
      category: data.category,
      image_url: data.image_url ?? null,
      stock: typeof data.stock === "number" ? data.stock : 0,
      tags: data.tags ?? [],
      description: data.description ?? null,
      specifications: data.specifications ?? {},
    })
    .select()
    .single()

  if (error || !product) {
    console.error("createRetailerProduct error:", error)
    throw new Error(error?.message ?? "Failed to create retailer product")
  }

  return product as Product
}

export async function getCategories(): Promise<string[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.from("products").select("category")

  if (error) {
    console.error("getCategories error:", error)
    return []
  }

  const categories = Array.from(
    new Set((data ?? []).map((p) => p.category))
  ).sort()
  return categories
}

export async function getCartByUser(
  userId: string
): Promise<(CartItem & { product: Product })[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from("cart")
    .select("*, product:products(*)")
    .eq("user_id", userId)
    .order("added_at", { ascending: false })

  if (error) {
    console.error("getCartByUser error:", error)
    return []
  }

  return (data ?? []) as (CartItem & { product: Product })[]
}

export async function getOrdersByUser(userId: string): Promise<Order[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("getOrdersByUser error:", error)
    return []
  }

  return (data ?? []) as Order[]
}

export async function getOrderById(
  id: string,
  userId: string
): Promise<{ order: Order; items: (OrderItem & { product: Product })[] } | null> {
  const supabase = await createServerSupabaseClient()
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single()

  if (orderError || !order) {
    console.error("getOrderById order error:", orderError)
    return null
  }

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("*, product:products(*)")
    .eq("order_id", id)

  if (itemsError) {
    console.error("getOrderById items error:", itemsError)
    return null
  }

  return {
    order: order as Order,
    items: (items ?? []) as (OrderItem & { product: Product })[],
  }
}

export async function createReturn(data: {
  order_id: string
  order_item_id: string
  user_id: string
  reason: string
  ai_analysis: Record<string, unknown>
}): Promise<Return> {
  const supabase = await createServerSupabaseClient()
  const { data: returnRecord, error } = await supabase
    .from("returns")
    .insert({
      order_id: data.order_id,
      order_item_id: data.order_item_id,
      user_id: data.user_id,
      reason: data.reason,
      ai_analysis: data.ai_analysis,
      status: "pending",
    })
    .select()
    .single()

  if (error || !returnRecord) {
    console.error("createReturn error:", error)
    throw new Error(error?.message ?? "Failed to create return")
  }

  return returnRecord as Return
}

export async function getReturnsByUser(userId: string): Promise<Return[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from("returns")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("getReturnsByUser error:", error)
    return []
  }

  return (data ?? []) as Return[]
}

export async function getReturnsByOrderId(orderId: string): Promise<Return[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from("returns")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("getReturnsByOrderId error:", error)
    return []
  }

  return (data ?? []) as Return[]
}

export async function getReturnById(
  id: string,
  userId: string
): Promise<Return | null> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from("returns")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single()

  if (error || !data) {
    console.error("getReturnById error:", error)
    return null
  }

  return data as Return
}

export async function getAllReturns(): Promise<
  (Return & { order: Order; user: Profile })[]
> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from("returns")
    .select("*, order:orders(*), user:profiles(*)")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("getAllReturns error:", error)
    return []
  }

  return (data ?? []) as (Return & { order: Order; user: Profile })[]
}

export async function updateReturnStatus(
  id: string,
  status: ReturnStatus
): Promise<Return> {
  const supabase = await createServerSupabaseClient()

  const updateData: { status: ReturnStatus; resolved_at?: string } = { status }
  if (status === "approved" || status === "declined" || status === "processed") {
    updateData.resolved_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from("returns")
    .update(updateData)
    .eq("id", id)
    .select()
    .single()

  if (error || !data) {
    console.error("updateReturnStatus error:", error)
    throw new Error(error?.message ?? "Failed to update return status")
  }

  return data as Return
}

export async function createNotification(data: {
  user_id: string
  type: Notification['type']
  channel: Notification['channel']
  content: Record<string, unknown>
  status?: Notification['status']
}): Promise<Notification> {
  const supabase = await createServerSupabaseClient()
  const { data: notification, error } = await supabase
    .from("notifications")
    .insert({
      user_id: data.user_id,
      type: data.type,
      channel: data.channel,
      content: data.content,
      status: data.status ?? "pending",
      sent_at: data.status === "sent" ? new Date().toISOString() : null,
    })
    .select()
    .single()

  if (error || !notification) {
    console.error("createNotification error:", error)
    throw new Error(error?.message ?? "Failed to create notification")
  }

  return notification as Notification
}

export async function getNotificationsByUser(userId: string): Promise<Notification[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("getNotificationsByUser error:", error)
    return []
  }

  return (data ?? []) as Notification[]
}

export async function updateNotificationStatus(
  id: string,
  status: Notification['status']
): Promise<void> {
  const supabase = await createServerSupabaseClient()

  const updateData: { status: Notification['status']; sent_at?: string | null } = { status }
  if (status === "sent") {
    updateData.sent_at = new Date().toISOString()
  }

  const { error } = await supabase
    .from("notifications")
    .update(updateData)
    .eq("id", id)

  if (error) {
    console.error("updateNotificationStatus error:", error)
    throw new Error(error.message)
  }
}

export async function getAbandonedCarts(): Promise<
  { user_id: string; email: string; full_name: string | null; items: (CartItem & { product: Product })[] }[]
> {
  const supabase = await createServerSupabaseClient()

  const { data: cartRows, error } = await supabase
    .from("cart")
    .select("*, product:products(*), user:profiles(*)")
    .order("added_at", { ascending: false })

  if (error) {
    console.error("getAbandonedCarts error:", error)
    return []
  }

  const rows = (cartRows ?? []) as (CartItem & { product: Product; user: Profile })[]

  // Group cart items by user.
  const byUser = new Map<string, typeof rows>()
  for (const row of rows) {
    if (!byUser.has(row.user_id)) {
      byUser.set(row.user_id, [])
    }
    byUser.get(row.user_id)!.push(row)
  }

  // Filter out users who already have orders.
  const userIds = Array.from(byUser.keys())
  const { data: orderRows } = await supabase
    .from("orders")
    .select("user_id")
    .in("user_id", userIds.length > 0 ? userIds : [""])

  const orderingUserIds = new Set((orderRows ?? []).map((o) => o.user_id))

  const result: {
    user_id: string
    email: string
    full_name: string | null
    items: (CartItem & { product: Product })[]
  }[] = []

  for (const [userId, userRows] of byUser.entries()) {
    if (orderingUserIds.has(userId)) continue

    const firstRow = userRows[0]
    result.push({
      user_id: userId,
      email: firstRow.user.email,
      full_name: firstRow.user.full_name,
      items: userRows.map(({ user: _user, ...item }) => item),
    })
  }

  return result
}

// Campaign queries

export async function createCampaign(data: {
  name: string
  template_id?: string | null
  target_segment: CampaignSegment
  status?: Campaign["status"]
}): Promise<Campaign> {
  const supabase = await createServerSupabaseClient()

  const { data: campaign, error } = await supabase
    .from("campaigns")
    .insert({
      name: data.name,
      template_id: data.template_id ?? null,
      target_segment: data.target_segment,
      status: data.status ?? "draft",
      sent_count: 0,
    })
    .select()
    .single()

  if (error || !campaign) {
    console.error("createCampaign error:", error)
    throw new Error(error?.message ?? "Failed to create campaign")
  }

  return campaign as Campaign
}

export async function getCampaigns(): Promise<Campaign[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from("campaigns")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("getCampaigns error:", error)
    return []
  }

  return (data ?? []) as Campaign[]
}

export async function getCampaignById(id: string): Promise<Campaign | null> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !data) {
    console.error("getCampaignById error:", error)
    return null
  }

  return data as Campaign
}

export async function updateCampaign(
  id: string,
  data: Partial<Campaign>
): Promise<Campaign> {
  const supabase = await createServerSupabaseClient()

  const { data: campaign, error } = await supabase
    .from("campaigns")
    .update(data)
    .eq("id", id)
    .select()
    .single()

  if (error || !campaign) {
    console.error("updateCampaign error:", error)
    throw new Error(error?.message ?? "Failed to update campaign")
  }

  return campaign as Campaign
}

export async function deleteCampaign(id: string): Promise<void> {
  const supabase = await createServerSupabaseClient()

  const { error } = await supabase.from("campaigns").delete().eq("id", id)

  if (error) {
    console.error("deleteCampaign error:", error)
    throw new Error(error.message ?? "Failed to delete campaign")
  }
}

export async function getEmailTemplates(): Promise<EmailTemplate[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from("email_templates")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("getEmailTemplates error:", error)
    return []
  }

  return (data ?? []) as EmailTemplate[]
}

export async function getEmailTemplateById(id: string): Promise<EmailTemplate | null> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from("email_templates")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !data) {
    console.error("getEmailTemplateById error:", error)
    return null
  }

  return data as EmailTemplate
}

export async function getUsersBySegment(segment: CampaignSegment): Promise<Profile[]> {
  const supabase = await createServerSupabaseClient()

  if (segment === "all") {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "customer")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("getUsersBySegment all error:", error)
      return []
    }

    return (data ?? []) as Profile[]
  }

  if (segment === "recent_buyers") {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    const { data: orderRows, error: orderError } = await supabase
      .from("orders")
      .select("user_id")
      .gte("created_at", since)

    if (orderError) {
      console.error("getUsersBySegment recent_buyers error:", orderError)
      return []
    }

    const userIds = Array.from(
      new Set((orderRows ?? []).map((row) => row.user_id))
    )

    if (userIds.length === 0) return []

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .in("id", userIds)
      .eq("role", "customer")

    if (error) {
      console.error("getUsersBySegment recent_buyers fetch error:", error)
      return []
    }

    return (data ?? []) as Profile[]
  }

  // cart_abandoners: users with cart items who haven't ordered in last 7 days
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data: cartRows, error: cartError } = await supabase
    .from("cart")
    .select("user_id")

  if (cartError) {
    console.error("getUsersBySegment cart_abandoners error:", cartError)
    return []
  }

  const cartUserIds = Array.from(
    new Set((cartRows ?? []).map((row) => row.user_id))
  )

  if (cartUserIds.length === 0) return []

  const { data: orderRows, error: orderError } = await supabase
    .from("orders")
    .select("user_id")
    .in("user_id", cartUserIds)
    .gte("created_at", since)

  if (orderError) {
    console.error("getUsersBySegment cart_abandoners orders error:", orderError)
    return []
  }

  const recentOrderingIds = new Set(
    (orderRows ?? []).map((row) => row.user_id)
  )

  const targetIds = cartUserIds.filter((id) => !recentOrderingIds.has(id))

  if (targetIds.length === 0) return []

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .in("id", targetIds)
    .eq("role", "customer")

  if (error) {
    console.error("getUsersBySegment cart_abandoners fetch error:", error)
    return []
  }

  return (data ?? []) as Profile[]
}

export async function getCampaignNotifications(campaignId: string): Promise<Notification[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("type", "campaign")
    .eq("content->>campaign_id", campaignId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("getCampaignNotifications error:", error)
    return []
  }

  return (data ?? []) as Notification[]
}

// Admin queries

export async function getAllOrders(): Promise<(Order & { user_email: string })[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from("orders")
    .select("*, user:profiles(email)")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("getAllOrders error:", error)
    return []
  }

  return ((data ?? []) as unknown as Array<Order & { user: { email: string } | null }>).map(
    (order) => ({
      ...order,
      user_email: order.user?.email ?? "",
    })
  ) as (Order & { user_email: string })[]
}

export async function getOrderByIdAdmin(
  id: string
): Promise<{ order: Order; items: (OrderItem & { product: Product })[]; user: Profile } | null> {
  const supabase = await createServerSupabaseClient()

  const { data: order, error } = await supabase
    .from("orders")
    .select("*, user:profiles(*)")
    .eq("id", id)
    .single()

  if (error || !order) {
    console.error("getOrderByIdAdmin error:", error)
    return null
  }

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("*, product:products(*)")
    .eq("order_id", id)

  if (itemsError) {
    console.error("getOrderByIdAdmin items error:", itemsError)
  }

  return {
    order: order as Order,
    items: (items ?? []) as (OrderItem & { product: Product })[],
    user: (order as unknown as { user: Profile }).user,
  }
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<Product> {
  const supabase = await createServerSupabaseClient()

  const { data: product, error } = await supabase
    .from("products")
    .update(data)
    .eq("id", id)
    .select()
    .single()

  if (error || !product) {
    console.error("updateProduct error:", error)
    throw new Error(error?.message ?? "Failed to update product")
  }

  return product as Product
}

export interface AdminStats {
  totalOrders: number
  totalRevenue: number
  totalProducts: number
  totalUsers: number
  abandonedCarts: number
  pendingReturns: number
  activeCampaigns: number
}

export async function getAdminStats(): Promise<AdminStats> {
  const supabase = await createServerSupabaseClient()

  const [
    ordersResult,
    productsResult,
    usersResult,
    pendingReturnsResult,
    activeCampaignsResult,
    abandonedCarts,
  ] = await Promise.all([
    supabase.from("orders").select("total, status"),
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("returns").select("*", { count: "exact", head: true }).in("status", ["pending", "reviewed"]),
    supabase.from("campaigns").select("*", { count: "exact", head: true }).eq("status", "draft"),
    getAbandonedCarts(),
  ])

  if (ordersResult.error) {
    console.error("getAdminStats orders error:", ordersResult.error)
  }

  const orders = (ordersResult.data ?? []) as Order[]
  const totalRevenue = orders
    .filter((order) => order.status !== "cancelled")
    .reduce((sum, order) => sum + (order.total ?? 0), 0)

  return {
    totalOrders: orders.length,
    totalRevenue,
    totalProducts: productsResult.count ?? 0,
    totalUsers: usersResult.count ?? 0,
    abandonedCarts: abandonedCarts.length,
    pendingReturns: pendingReturnsResult.count ?? 0,
    activeCampaigns: activeCampaignsResult.count ?? 0,
  }
}

export async function getRecentOrders(limit: number): Promise<Order[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("getRecentOrders error:", error)
    return []
  }

  return (data ?? []) as Order[]
}

export async function getRevenueByDateRange(days: number): Promise<{ date: string; revenue: number }[]> {
  const supabase = await createServerSupabaseClient()
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from("orders")
    .select("total, status, created_at")
    .gte("created_at", since)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("getRevenueByDateRange error:", error)
    return []
  }

  const orders = ((data ?? []) as Order[]).filter((order) => order.status !== "cancelled")
  const result: { date: string; revenue: number }[] = []

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    const key = d.toISOString().split("T")[0]
    const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    const revenue = orders
      .filter((order) => order.created_at.startsWith(key))
      .reduce((sum, order) => sum + order.total, 0)
    result.push({ date: label, revenue })
  }

  return result
}

export async function getAllNotifications(): Promise<
  (Notification & { user_email: string | null; user_name: string | null })[]
> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from("notifications")
    .select("*, user:profiles(email, full_name)")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("getAllNotifications error:", error)
    return []
  }

  return ((data ?? []) as unknown as Array<
    Notification & { user: { email: string | null; full_name: string | null } | null }
  >).map((notification) => ({
    ...notification,
    user_email: notification.user?.email ?? null,
    user_name: notification.user?.full_name ?? null,
  })) as (Notification & { user_email: string | null; user_name: string | null })[]
}

export async function getReturnByIdAdmin(
  id: string
): Promise<{
  return: Return
  order: Order
  orderItem: OrderItem & { product: Product }
  user: Profile
} | null> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from("returns")
    .select("*, order:orders(*), order_item:order_items(*, product:products(*)), user:profiles(*)")
    .eq("id", id)
    .single()

  if (error || !data) {
    console.error("getReturnByIdAdmin error:", error)
    return null
  }

  const record = data as unknown as {
    return: Return
    order: Order
    order_item: OrderItem & { product: Product }
    user: Profile
  }

  return {
    return: record.return,
    order: record.order,
    orderItem: record.order_item,
    user: record.user,
  }
}
