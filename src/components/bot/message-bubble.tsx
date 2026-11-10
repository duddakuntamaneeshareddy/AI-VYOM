"use client"

import { motion } from "framer-motion"
import ReactMarkdown from "react-markdown"
import type { Components } from "react-markdown"

interface MessageBubbleProps {
  role: "user" | "assistant"
  content: string
  timestamp?: string
}

const markdownComponents: Components = {
  p({ children }) {
    return <p className="my-1">{children}</p>
  },
  strong({ children }) {
    return <strong className="font-semibold">{children}</strong>
  },
  code({ children, className }) {
    const isBlock = /language-/.test(className ?? "")
    return (
      <code
        className={
          isBlock
            ? "font-mono"
            : "rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]"
        }
      >
        {children}
      </code>
    )
  },
  pre({ children }) {
    return (
      <pre className="rounded bg-muted/60 p-2 text-[0.85em] overflow-x-auto">
        {children}
      </pre>
    )
  },
  ul({ children }) {
    return <ul className="list-disc pl-4 space-y-0.5">{children}</ul>
  },
  ol({ children }) {
    return <ol className="list-decimal pl-4 space-y-0.5">{children}</ol>
  },
  li({ children }) {
    return <li>{children}</li>
  },
  a({ children, href }) {
    return (
      <a
        href={href}
        className="underline underline-offset-2 hover:opacity-80"
      >
        {children}
      </a>
    )
  },
}

export function MessageBubble({ role, content, timestamp }: MessageBubbleProps) {
  const isUser = role === "user"

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "glass-card rounded-bl-sm"
        }`}
      >
        {isUser ? (
          <p>{content}</p>
        ) : (
          <div className="markdown-content">
            <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
          </div>
        )}
        {timestamp && (
          <p
            className={`mt-1 text-[10px] opacity-70 ${
              isUser ? "text-right" : "text-left"
            }`}
          >
            {timestamp}
          </p>
        )}
      </div>
    </motion.div>
  )
}
