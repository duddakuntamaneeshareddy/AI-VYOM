import * as React from "react"
import { EmailLayout } from "./email-layout"

interface RetentionEmailProps {
  userName: string
  offerCode: string
  message: string
  appUrl: string
}

export function RetentionEmail({
  userName,
  offerCode,
  message,
  appUrl,
}: RetentionEmailProps) {
  const shopUrl = `${appUrl}/products`

  return (
    <EmailLayout preview="A special offer just for you — don't miss out.">
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
          fontSize: "30px",
          fontWeight: 800,
          lineHeight: 1.2,
          color: "#111827",
          margin: "0 0 16px",
          textAlign: "center",
        }}
      >
        We miss you, {userName}
      </h1>

      <p
        style={{
          fontSize: "17px",
          lineHeight: 1.6,
          color: "#52525b",
          margin: "0 0 32px",
          textAlign: "center",
        }}
      >
        {message}
      </p>

      <div
        style={{
          backgroundColor: "#ede9fe",
          borderRadius: "16px",
          padding: "28px",
          marginBottom: "32px",
          textAlign: "center",
          border: "2px dashed #a78bfa",
        }}
      >
        <p
          style={{
            margin: "0 0 8px",
            fontSize: "13px",
            fontWeight: 700,
            color: "#6d28d9",
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          Your exclusive code
        </p>
        <span
          style={{
            display: "inline-block",
            fontSize: "28px",
            fontWeight: 800,
            color: "#4c1d95",
            letterSpacing: "1.5px",
            fontFamily:
              "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          }}
        >
          {offerCode}
        </span>
      </div>

      <div style={{ textAlign: "center" }}>
        <a
          href={shopUrl}
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
          Shop Now
        </a>
      </div>

      <p
        style={{
          fontSize: "12px",
          lineHeight: 1.6,
          color: "#a1a1aa",
          margin: "32px 0 0",
          textAlign: "center",
        }}
      >
        Offer valid for a limited time. Cannot be combined with other promotions.
      </p>
    </EmailLayout>
  )
}
