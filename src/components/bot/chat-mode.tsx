"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { MessageBubble } from "./message-bubble"

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp?: string
}

interface ChatModeProps {
  messages: Message[]
  onSend: (text: string) => void
  isTyping: boolean
}

const SUGGESTED_PROMPTS = [
  "Track my order",
  "Recommend products",
  "Check inventory",
]

export function ChatMode({ messages, onSend, isTyping }: ChatModeProps) {
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || isTyping) return

    setInput("")
    onSend(text)
  }

  return (
    <div className="flex h-full flex-col">
      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto p-4"
      >
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              role={message.role}
              content={message.content}
              timestamp={message.timestamp}
            />
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="flex justify-start"
          >
            <div className="glass-card rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex items-center gap-1.5">
                <motion.span
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: 0 }}
                  className="h-2 w-2 rounded-full bg-muted-foreground"
                />
                <motion.span
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: 0.15 }}
                  className="h-2 w-2 rounded-full bg-muted-foreground"
                />
                <motion.span
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: 0.3 }}
                  className="h-2 w-2 rounded-full bg-muted-foreground"
                />
              </div>
            </div>
          </motion.div>
        )}

        {messages.length === 0 && !isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-3"
          >
            <p className="text-center text-sm text-muted-foreground">
              How can I help you today?
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <Button
                  key={prompt}
                  variant="outline"
                  size="sm"
                  className="rounded-full text-xs"
                  onClick={() => onSend(prompt)}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t bg-background/50 p-3 backdrop-blur-sm"
      >
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-full border border-input bg-background px-4 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            disabled={isTyping}
            aria-label="Chat message"
          />
          <Button
            type="submit"
            size="icon"
            className="rounded-full"
            disabled={!input.trim() || isTyping}
            aria-label="Send message"
          >
            <Send className="size-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}
