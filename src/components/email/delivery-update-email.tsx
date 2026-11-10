import * as React from "react"
import { EmailLayout } from "./email-layout"

interface DeliveryUpdateEmailProps {
  userName: string
  orderNumber: string
  status: string
  items: { name: string; quantity: number }[]
  appUrl: string
}

const statusLabel: Record<string, string> = {
  pending: "Order Pending",
  confirmed: "Order Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
}

const statusColor: Record<string, string> = {
  pending: "#f59e0b",
  confirmed: "#4f46e5",
  shipped: "#06b6d4",
  delivered: "#10b981",
  cancelled: "#ef4444",
}

export function DeliveryUpdateEmail({
  userName,
  orderNumber,
  status,
  items,
  appUrl,
}: DeliveryUpdateEmailProps) {
  const normalizedStatus = status.toLowerCase()
  const label = statusLabel[normalizedStatus] ?? status
  const color = statusColor[normalizedStatus] ?? "#4f46e5"
  const ordersUrl = `${appUrl}/orders`

  return (
    <EmailLayout preview={`Your order ${orderNumber} is now ${label}.`}>
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <span
          style={{
            display: "inline-block",
            fontSize: "28px",
            fontWeight: 800,
            letterSpacing: "-0.5px",
            color: "#0a0a0a",
          }}
        >
          AI{" "}
          <span style={{ color: "#4f46e5" }}>Commerce</span>
        </span>
      </div>

      <h1
        style={{
          fontSize: "26px",
          fontWeight: 700,
          lineHeight: 1.25,
          color: "#111827",
          margin: "0 0 12px",
          textAlign: "center",
        }}
      >
        Hi {userName}, your order is updated
      </h1>

      <div
        style={{
          backgroundColor: "#fafafa",
          borderRadius: "16px",
          padding: "24px",
          marginBottom: "32px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            margin: "0 0 8px",
            fontSize: "14px",
            fontWeight: 600,
            color: "#71717a",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Order {orderNumber}
        </p>
        <span
          style={{
            display: "inline-block",
            padding: "8px 18px",
            borderRadius: "9999px",
            backgroundColor: color,
            color: "#ffffff",
            fontSize: "16px",
            fontWeight: 700,
          }}
        >
          {label}
        </span>
      </div>

      <h2
        style={{
          fontSize: "18px",
          fontWeight: 700,
          color: "#18181b",
          margin: "0 0 16px",
        }}
      >
        Items in this order
      </h2>

      <table
        role="presentation"
        width="100%"
        style={{ marginBottom: "32px", borderCollapse: "collapse" }}
      >
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td
                style={{
                  padding: "14px 0",
                  borderBottom: "1px solid #e4e4e7",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: "15px",
                    fontWeight: 600,
                    color: "#18181b",
                  }}
                >
                  {item.name}
                </p>
              </td>
              <td
                style={{
                  padding: "14px 0",
                  borderBottom: "1px solid #e4e4e7",
                  textAlign: "right",
                  verticalAlign: "top",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: "14px",
                    color: "#71717a",
                  }}
                >
                  Qty: {item.quantity}
                </p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ textAlign: "center" }}>
        <a
          href={ordersUrl}
          style={{
            display: "inline-block",
            padding: "16px 32px",
            backgroundColor: "#4f46e5",
            color: "#ffffff",
            fontSize: "16px",
            fontWeight: 700,
            textDecoration: "none",
            borderRadius: "9999px",
            boxShadow: "0 8px 20px rgba(79,70,229,0.3)",
          }}
        >
          Track Your Order
        </a>
      </div>
    </EmailLayout>
  )
}
