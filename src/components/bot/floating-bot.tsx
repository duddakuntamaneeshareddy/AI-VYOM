"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Bot, X, MessageSquare, Mic, Ear } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useWakeWord } from "@/hooks/use-wake-word"
import { ChatMode, Message } from "./chat-mode"
import { VoiceMode } from "./voice-mode"
import { useCart } from "@/hooks/use-cart"
import { usePageContext } from "@/hooks/use-page-context"
import type { Action, PageContext } from "@/lib/ai/types"

type BotMode = "text" | "voice"

function detectPageType(pathname: string): PageContext["pageType"] {
  if (pathname === "/") return "home"
  if (pathname === "/products") return "product-list"
  if (/^\/products\/[^/]+$/.test(pathname)) return "product-detail"
  if (pathname === "/cart") return "cart"
  if (pathname === "/orders") return "orders"
  if (pathname === "/returns") return "returns"
  if (pathname.startsWith("/admin")) return "admin"
  return "other"
}

export function FloatingBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<BotMode>("text")
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const router = useRouter()
  const pathname = usePathname()
  const { addToCart, removeFromCart, clearCart } = useCart()
  const { visibleProducts } = usePageContext()

  const [showIntroBubble, setShowIntroBubble] = useState(false)

  // Show intro bubble 1.5s after mount, only if user hasn't opened the bot before
  useEffect(() => {
    const seen = sessionStorage.getItem("bot-intro-seen")
    if (seen) return
    const timer = setTimeout(() => setShowIntroBubble(true), 1500)
    return () => clearTimeout(timer)
  }, [])

  const [wakeWordEnabled, setWakeWordEnabled] = useState(false)
  const [autoStartVoice, setAutoStartVoice] = useState(false)
  
  useEffect(() => {
    setWakeWordEnabled(localStorage.getItem("wake-word-enabled") === "true")
  }, [])

  const toggleWakeWord = (checked: boolean) => {
    setWakeWordEnabled(checked)
    localStorage.setItem("wake-word-enabled", String(checked))
  }

  const { isSupported: isWakeWordSupported } = useWakeWord({
    enabled: wakeWordEnabled && !isOpen,
    onDetected: () => {
      setIsOpen(true)
      setMode("voice")
      setAutoStartVoice(true)
    }
  })

  function toggleOpen() {
    setIsOpen((prev) => {
      if (!prev) {
        setUnreadCount(0)
        setShowIntroBubble(false)
        sessionStorage.setItem("bot-intro-seen", "1")
      } else {
        setAutoStartVoice(false)
      }
      return !prev
    })
  }

  function executeAction(action: Action) {
    switch (action.type) {
      case "navigate_to":
      case "list_products":
      case "open_product":
        if (action.path) router.push(action.path)
        break
      case "open_cart":
        router.push("/cart")
        break
      case "add_to_cart":
        if (action.productId) {
          addToCart(action.productId)
            .then(() => router.push("/cart"))
            .catch(console.error)
        }
        break
      case "remove_from_cart":
        if (action.itemId) removeFromCart(action.itemId).catch(console.error)
        break
      case "clear_cart":
        clearCart().catch(console.error)
        break
    }
  }

  async function handleSend(
    text: string
  ): Promise<{ response: string; chatLogId?: string }> {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsTyping(true)

    const assistantId = crypto.randomUUID()
    const assistantMessage: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }

    setMessages((prev) => [...prev, assistantMessage])
    if (!isOpen) {
      setUnreadCount((count) => count + 1)
    }

    const pageContext: PageContext = {
      url: pathname,
      pageType: detectPageType(pathname),
      visibleProducts,
    }

    const fallback =
      "Something went wrong. Please check your connection and try again."
    let accumulated = ""

    const applyFallback = () => {
      accumulated = fallback
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, content: fallback } : m
        )
      )
      setIsTyping(false)
    }

    const processSseLine = (line: string): boolean => {
      if (!line.startsWith("data:")) return false

      const payload = line.slice("data:".length).trim()
      if (payload === "[DONE]") return true

      try {
        const parsed = JSON.parse(payload) as {
          content?: string
          actions?: Action[]
        }

        if (parsed.actions) {
          parsed.actions.forEach(executeAction)
          return false
        }

        const chunk = parsed.content ?? ""
        if (!chunk) return false

        accumulated += chunk
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: accumulated } : m
          )
        )
      } catch {
        // Malformed SSE payload; ignore and continue streaming.
      }

      return false
    }

    try {
      const response = await fetch("/api/ai/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          mode,
          pageContext,
        }),
      })

      if (!response.ok || !response.body) {
        throw new Error("Failed to get a response")
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const events = buffer.split("\n\n")
        buffer = events.pop() ?? ""

        for (const event of events) {
          for (const line of event.split("\n")) {
            if (processSseLine(line)) {
              setIsTyping(false)
              return { response: accumulated }
            }
          }
        }
      }

      // Process any trailing event buffered at stream end.
      if (buffer.trim()) {
        for (const line of buffer.split("\n")) {
          if (processSseLine(line)) {
            setIsTyping(false)
            return { response: accumulated }
          }
        }
      }

      setIsTyping(false)
      return { response: accumulated }
    } catch {
      applyFallback()
      return { response: fallback }
    }
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-20 right-4 z-50 flex h-[560px] w-[calc(100vw-2rem)] max-w-[400px] flex-col overflow-hidden rounded-3xl glass-card shadow-2xl"
          >
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Bot className="size-4" />
                </div>
                <div>
                  <h3 className="font-heading text-sm font-semibold">
                    AI Assistant
                  </h3>
                  <p className="text-[10px] text-muted-foreground">
                    {isTyping
                      ? mode === "voice"
                        ? "Thinking..."
                        : "Typing..."
                      : "Ready to help"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {isWakeWordSupported && (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className={`rounded-full ${wakeWordEnabled ? "bg-primary/20 text-primary" : ""}`}
                    onClick={() => toggleWakeWord(!wakeWordEnabled)}
                    title={wakeWordEnabled ? "Wake word 'Hey Vyom' ON" : "Wake word 'Hey Vyom' OFF"}
                    aria-label="Toggle wake word"
                  >
                    <Ear className="size-3.5" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className={`rounded-full ${mode === "text" ? "bg-muted" : ""}`}
                  onClick={() => { setMode("text"); setAutoStartVoice(false); }}
                  aria-label="Text mode"
                >
                  <MessageSquare className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className={`rounded-full ${mode === "voice" ? "bg-muted" : ""}`}
                  onClick={() => { setMode("voice"); setAutoStartVoice(false); }}
                  aria-label="Voice mode"
                >
                  <Mic className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="rounded-full"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close assistant"
                >
                  <X className="size-3.5" />
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              {mode === "text" ? (
                <ChatMode
                  messages={messages}
                  onSend={handleSend}
                  isTyping={isTyping}
                />
              ) : (
                <VoiceMode 
                  messages={messages} 
                  onSend={handleSend} 
                  autoStart={autoStartVoice} 
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="group fixed bottom-4 right-4 z-50 flex items-end gap-2">
        {/* First-visit intro bubble */}
        <AnimatePresence>
          {showIntroBubble && !isOpen && (
            <motion.div
              initial={{ opacity: 0, x: 16, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 16, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="mb-1 mr-2 max-w-[220px] rounded-2xl rounded-br-sm bg-primary px-4 py-3 text-sm text-primary-foreground shadow-xl"
            >
              <p className="font-semibold">Hi! I&apos;m your AI assistant 👋</p>
              <p className="mt-0.5 text-xs text-primary-foreground/80">
                Ask me anything or shop by voice!
              </p>
              <button
                onClick={() => setShowIntroBubble(false)}
                className="mt-1.5 text-[10px] text-primary-foreground/60 underline underline-offset-2 hover:text-primary-foreground"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pill label — always visible when closed */}
        {!isOpen && (
          <button
            onClick={toggleOpen}
            className="mb-1 hidden items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-lg ring-1 ring-border transition-all hover:bg-primary hover:text-primary-foreground sm:flex"
            aria-label="Open AI assistant"
          >
            <Bot className="size-3.5" />
            Try AI
          </button>
        )}

        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleOpen}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl ring-4 ring-primary/20"
          aria-label="Open AI assistant"
        >
          {/* Breathing + pulse ring */}
          <motion.div
            animate={
              isOpen
                ? { scale: 1, boxShadow: "0 0 0 0 rgba(79, 70, 229, 0)" }
                : {
                    scale: [1, 1.08, 1],
                    boxShadow: [
                      "0 0 0 0 rgba(79, 70, 229, 0.4)",
                      "0 0 0 14px rgba(79, 70, 229, 0)",
                    ],
                  }
            }
            transition={{
              duration: 2.4,
              repeat: isOpen ? 0 : Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-0 rounded-full"
          />

          {isOpen ? (
            <X className="relative size-6" />
          ) : (
            <Bot className="relative size-6" />
          )}

          {/* Unread indicator */}
          {!isOpen && unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground ring-2 ring-background">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </motion.button>
      </div>
    </>
  )
}
