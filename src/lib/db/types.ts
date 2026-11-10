export type ProfileRole = 'customer' | 'admin' | 'retailer'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: ProfileRole
  created_at: string
}

export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  category: string
  image_url: string | null
  stock: number
  tags: string[]
  specifications: Record<string, string> | null
  retailer_id: string | null
  created_at: string
}

export interface ProductReview {
  id: string
  product_id: string
  user_id: string
  rating: number
  comment: string
  created_at: string
  updated_at: string
  profiles?: { full_name: string | null; email: string | null } | null
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'

export interface Order {
  id: string
  user_id: string
  status: OrderStatus
  total: number
  shipping_address: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price_at_purchase: number
}

export interface CartItem {
  id: string
  user_id: string
  product_id: string
  quantity: number
  added_at: string
}

export type ReturnStatus = 'pending' | 'reviewed' | 'approved' | 'declined' | 'processed'

export interface Return {
  id: string
  order_id: string
  order_item_id: string
  user_id: string
  reason: string
  ai_analysis: Record<string, unknown> | null
  status: ReturnStatus
  created_at: string
  resolved_at: string | null
}

export type NotificationType = 'cart_abandonment' | 'delivery' | 'engagement' | 'campaign'
export type NotificationChannel = 'email' | 'in_app'
export type NotificationStatus = 'pending' | 'sent' | 'failed'

export interface Notification {
  id: string
  user_id: string | null
  type: NotificationType
  channel: NotificationChannel
  content: Record<string, unknown>
  status: NotificationStatus
  sent_at: string | null
  created_at: string
}

export type CampaignSegment = 'all' | 'cart_abandoners' | 'recent_buyers'
export type CampaignStatus = 'draft' | 'sent'

export interface Campaign {
  id: string
  name: string
  template_id: string | null
  target_segment: CampaignSegment
  status: CampaignStatus
  sent_count: number
  created_at: string
  sent_at: string | null
}

export type EmailTemplateType = 'cart_abandonment' | 'delivery' | 'retention' | 'return_update'

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  type: EmailTemplateType
  created_at: string
}

export type ChatMode = 'text' | 'voice'

export interface ChatLog {
  id: string
  user_id: string | null
  mode: ChatMode
  messages: Record<string, unknown>[]
  created_at: string
}

export interface VoiceLog {
  id: string
  chat_log_id: string
  duration_seconds: number | null
  stt_text: string | null
  tts_audio_url: string | null
  created_at: string
}
