import * as React from "react"
import { EmailLayout } from "./email-layout"

interface ReturnUpdateEmailProps {
  userName: string
  returnId: string
  status: string
  summary: string
  appUrl: string
}

const statusLabel: Record<string, string> = {
  pending: "Pending Review",
  reviewed: "Reviewed",
  approved: "Approved",
  declined: "Declined",
  processed: "Processed",
}

const statusColor: Record<string, string> = {
  pending: "#f59e0b",
  reviewed: "#4f46e5",
  approved: "#10b981",
  declined: "#ef4444",
  processed: "#06b6d4",
}

export function ReturnUpdateEmail({
  userName,
  returnId,
  status,
  summary,
  appUrl,
}: ReturnUpdateEmailProps) {
  const normalizedStatus = status.toLowerCase()
  const label = statusLabel[normalizedStatus] ?? status
  const color = statusColor[normalizedStatus] ?? "#4f46e5"
  const returnsUrl = `${appUrl}/orders`

  return (
    <EmailLayout preview={`Your return request ${returnId} is now ${label}.`}>
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
        Return update for {userName}
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
          Return {returnId}
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
          fontSize: "16px",
          fontWeight: 700,
          color: "#18181b",
          margin: "0 0 12px",
        }}
      >
        AI Analysis Summary
      </h2>

      <div
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e4e4e7",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "32px",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "15px",
            lineHeight: 1.6,
            color: "#52525b",
          }}
        >
          {summary}
        </p>
      </div>

      <div style={{ textAlign: "center" }}>
        <a
          href={returnsUrl}
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
          View Details
        </a>
      </div>
    </EmailLayout>
  )
}
