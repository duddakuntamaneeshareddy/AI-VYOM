import * as React from "react"

import { emailService } from "@/lib/email"
import { createServerSupabaseClient } from "@/lib/db/supabase-server"
import type {
  Notification,
  NotificationType,
  NotificationChannel,
  NotificationStatus,
} from "@/lib/db/types"
import { CartAbandonmentEmail } from "@/components/email/cart-abandonment-email"
import { DeliveryUpdateEmail } from "@/components/email/delivery-update-email"
import { RetentionEmail } from "@/components/email/retention-email"
import { ReturnUpdateEmail } from "@/components/email/return-update-email"

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

export interface NotificationService {
  sendCartAbandonment(userId: string, cartItems: unknown[]): Promise<void>
  sendDeliveryUpdate(userId: string, order: unknown, newStatus: string): Promise<void>
  sendEngagement(userId: string, message: string): Promise<void>
  sendReturnUpdate(userId: string, returnRecord: unknown, newStatus: string): Promise<void>
  sendCampaign(
    userId: string,
    campaignId: string,
    campaign: { name: string; offerCode: string; message: string }
  ): Promise<boolean>
  getInAppNotifications(userId: string): Promise<Notification[]>
  markAsRead(id: string): Promise<void>
}

interface CartItemShape {
  name?: string
  price?: number
  quantity?: number
  product?: { name?: string; price?: number }
}

interface OrderShape {
  id?: string
  order_number?: string
  items?: Array<{ name?: string; quantity?: number; product?: { name?: string } }>
}

interface ReturnShape {
  id?: string
  ai_analysis?: { summary?: string } | null
}

class SupabaseNotificationService implements NotificationService {
  async sendCartAbandonment(
    userId: string,
    cartItems: unknown[]
  ): Promise<void> {
    const profile = await this.getProfile(userId)
    const items = cartItems.map((item) => this.normalizeCartItem(item))
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

    const content = {
      userName: profile?.full_name ?? "there",
      items,
      total,
      appUrl,
    }

    await this.sendAndRecord({
      userId,
      type: "cart_abandonment",
      channel: "email",
      subject: "You left something behind",
      react: React.createElement(CartAbandonmentEmail, content),
      content,
    })
  }

  async sendDeliveryUpdate(
    userId: string,
    order: unknown,
    newStatus: string
  ): Promise<void> {
    const profile = await this.getProfile(userId)
    const normalizedOrder = this.normalizeOrder(order)
    const items =
      normalizedOrder.items?.map((item) => ({
        name: item.name ?? item.product?.name ?? "Item",
        quantity: item.quantity ?? 1,
      })) ?? []

    const content = {
      userName: profile?.full_name ?? "there",
      orderNumber: normalizedOrder.order_number ?? normalizedOrder.id ?? "",
      status: newStatus,
      items,
      appUrl,
    }

    await this.sendAndRecord({
      userId,
      type: "delivery",
      channel: "email",
      subject: `Your order is now ${newStatus}`,
      react: React.createElement(DeliveryUpdateEmail, content),
      content,
    })
  }

  async sendEngagement(userId: string, message: string): Promise<void> {
    const profile = await this.getProfile(userId)

    const content = {
      userName: profile?.full_name ?? "there",
      message,
      appUrl,
    }

    // Engagement notifications are in-app only.
    await this.saveNotification({
      userId,
      type: "engagement",
      channel: "in_app",
      status: "sent",
      content,
    })
  }

  async sendReturnUpdate(
    userId: string,
    returnRecord: unknown,
    newStatus: string
  ): Promise<void> {
    const profile = await this.getProfile(userId)
    const normalizedReturn = this.normalizeReturn(returnRecord)
    const aiAnalysis = normalizedReturn.ai_analysis ?? {}
    const summary =
      typeof aiAnalysis === "object" && aiAnalysis !== null
        ? (aiAnalysis as { summary?: string }).summary ??
          "Your return request has been reviewed."
        : "Your return request has been reviewed."

    const content = {
      userName: profile?.full_name ?? "there",
      returnId: normalizedReturn.id ?? "",
      status: newStatus,
      summary,
      appUrl,
    }

    await this.sendAndRecord({
      userId,
      type: "delivery",
      channel: "email",
      subject: `Your return is now ${newStatus}`,
      react: React.createElement(ReturnUpdateEmail, content),
      content,
    })
  }

  async sendCampaign(
    userId: string,
    campaignId: string,
    campaign: { name: string; offerCode: string; message: string }
  ): Promise<boolean> {
    const profile = await this.getProfile(userId)

    const content = {
      userName: profile?.full_name ?? "there",
      offerCode: campaign.offerCode,
      message: campaign.message,
      appUrl,
    }

    return this.sendAndRecord({
      userId,
      type: "campaign",
      channel: "email",
      subject: campaign.name,
      react: React.createElement(RetentionEmail, content),
      content: { ...content, campaign_id: campaignId, campaign_name: campaign.name },
    })
  }

  async getInAppNotifications(userId: string): Promise<Notification[]> {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .eq("channel", "in_app")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("getInAppNotifications error:", error)
      throw new Error(error.message)
    }

    return (data ?? []) as Notification[]
  }

  async markAsRead(id: string): Promise<void> {
    const supabase = await createServerSupabaseClient()

    const { data: existing, error: fetchError } = await supabase
      .from("notifications")
      .select("content")
      .eq("id", id)
      .single()

    if (fetchError || !existing) {
      throw new Error(fetchError?.message ?? "Notification not found")
    }

    const content = (existing.content ?? {}) as Record<string, unknown>
    const { error } = await supabase
      .from("notifications")
      .update({
        content: { ...content, read: true },
      })
      .eq("id", id)

    if (error) {
      throw new Error(error.message)
    }
  }

  private async getProfile(userId: string) {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", userId)
      .single()

    if (error) {
      console.error("getProfile error:", error)
      return null
    }

    return data as { email: string | null; full_name: string | null } | null
  }

  private normalizeCartItem(item: unknown): { name: string; price: number; quantity: number } {
    const raw = (item ?? {}) as CartItemShape
    const name =
      raw.name ?? raw.product?.name ?? "Product"
    const price =
      typeof raw.price === "number"
        ? raw.price
        : typeof raw.product?.price === "number"
          ? raw.product.price
          : 0
    const quantity = typeof raw.quantity === "number" ? raw.quantity : 1

    return { name, price, quantity }
  }

  private normalizeOrder(order: unknown): OrderShape {
    const raw = (order ?? {}) as OrderShape
    return {
      id: raw.id,
      order_number: raw.order_number,
      items: Array.isArray(raw.items) ? raw.items : [],
    }
  }

  private normalizeReturn(returnRecord: unknown): ReturnShape {
    const raw = (returnRecord ?? {}) as ReturnShape
    return {
      id: raw.id,
      ai_analysis: raw.ai_analysis,
    }
  }

  private async sendAndRecord({
    userId,
    type,
    channel,
    subject,
    react,
    content,
  }: {
    userId: string
    type: NotificationType
    channel: NotificationChannel
    subject: string
    react: React.ReactElement
    content: Record<string, unknown>
  }): Promise<boolean> {
    const profile = await this.getProfile(userId)
    if (!profile?.email) {
      await this.saveNotification({
        userId,
        type,
        channel,
        status: "failed",
        content: { ...content, error: "User email not found" },
      })
      return false
    }

    const result = await emailService.send({
      to: profile.email,
      subject,
      react,
    })

    if (result.success) {
      await this.saveNotification({
        userId,
        type,
        channel,
        status: "sent",
        content,
      })
      return true
    } else {
      await this.saveNotification({
        userId,
        type,
        channel,
        status: "failed",
        content: { ...content, error: result.error },
      })
      return false
    }
  }

  private async saveNotification({
    userId,
    type,
    channel,
    status,
    content,
  }: {
    userId: string
    type: NotificationType
    channel: NotificationChannel
    status: NotificationStatus
    content: Record<string, unknown>
  }): Promise<void> {
    const supabase = await createServerSupabaseClient()

    const { error } = await supabase.from("notifications").insert({
      user_id: userId,
      type,
      channel,
      status,
      content,
      sent_at: status === "sent" ? new Date().toISOString() : null,
    })

    if (error) {
      console.error("saveNotification error:", error)
      throw new Error(error.message)
    }
  }
}

export const notificationService: NotificationService =
  new SupabaseNotificationService()
