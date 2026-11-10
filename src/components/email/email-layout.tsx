import * as React from "react"

interface EmailLayoutProps {
  children: React.ReactNode
  preview?: string
}

export function EmailLayout({ children, preview }: EmailLayoutProps) {
  return (
    <html>
      <head>
        <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {preview && <meta name="description" content={preview} />}
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: "#f4f4f5",
          fontFamily:
            "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          WebkitFontSmoothing: "antialiased",
        }}
      >
        <table
          role="presentation"
          width="100%"
          cellPadding={0}
          cellSpacing={0}
          border={0}
        >
          <tbody>
            <tr>
              <td align="center" style={{ padding: "40px 16px" }}>
                <table
                  role="presentation"
                  width="100%"
                  style={{
                    maxWidth: "600px",
                    width: "100%",
                    backgroundColor: "#ffffff",
                    borderRadius: "20px",
                    overflow: "hidden",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
                  }}
                  cellPadding={0}
                  cellSpacing={0}
                  border={0}
                >
                  <tbody>
                    <tr>
                      <td style={{ padding: "40px" }}>{children}</td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  )
}
