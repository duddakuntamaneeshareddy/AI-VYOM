import * as React from "react"
import { EmailLayout } from "./email-layout"

interface CartAbandonmentEmailProps {
  userName: string
  items: { name: string; price: number; quantity: number }[]
  total: number
  appUrl: string
}

export function CartAbandonmentEmail({
  userName,
  items,
  total,
  appUrl,
}: CartAbandonmentEmailProps) {
  const cartUrl = `${appUrl}/cart`

  return (
    <EmailLayout preview="You left something behind — complete your order today.">
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
        You left something behind, {userName}
      </h1>

      <p
        style={{
          fontSize: "16px",
          lineHeight: 1.6,
          color: "#52525b",
          margin: "0 0 32px",
          textAlign: "center",
        }}
      >
        Your cart is waiting for you. Complete your order while everything is still
        in stock.
      </p>

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
                  padding: "16px 0",
                  borderBottom: "1px solid #e4e4e7",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "#18181b",
                  }}
                >
                  {item.name}
                </p>
                <p
                  style={{
                    margin: "4px 0 0",
                    fontSize: "14px",
                    color: "#71717a",
                  }}
                >
                  Qty: {item.quantity}
                </p>
              </td>
              <td
                style={{
                  padding: "16px 0",
                  borderBottom: "1px solid #e4e4e7",
                  textAlign: "right",
                  verticalAlign: "top",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "#18181b",
                  }}
                >
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "32px",
        }}
      >
        <span
          style={{
            fontSize: "16px",
            fontWeight: 600,
            color: "#52525b",
          }}
        >
          Total
        </span>
        <span
          style={{
            fontSize: "22px",
            fontWeight: 800,
            color: "#111827",
          }}
        >
          ${total.toFixed(2)}
        </span>
      </div>

      <div style={{ textAlign: "center" }}>
        <a
          href={cartUrl}
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
          Complete Your Order
        </a>
      </div>

      <p
        style={{
          fontSize: "13px",
          lineHeight: 1.6,
          color: "#a1a1aa",
          margin: "32px 0 0",
          textAlign: "center",
        }}
      >
        If you did not request this email, you can safely ignore it.
      </p>
    </EmailLayout>
  )
}
