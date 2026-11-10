"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, MicOff, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useVoice } from "@/hooks/use-voice"
import { VoiceOrb } from "./voice-orb"
import { Message } from "./chat-mode"

export interface VoiceModeProps {
  messages: Message[]
  onSend: (
    text: string
  ) => Promise<{ response: string; chatLogId?: string } | undefined>
  autoStart?: boolean
}

function stateLabel(state: ReturnType<typeof useVoice>["state"]): string {
  switch (state) {
    case "listening":
      return "Listening..."
    case "thinking":
      return "Thinking..."
    case "speaking":
      return "Speaking..."
    default:
      return "Tap to speak"
  }
}

export function VoiceMode({ onSend, autoStart }: VoiceModeProps) {
  const [response, setResponse] = useState("")
  const [autoLoop, setAutoLoop] = useState(false)
  const turnStartRef = useRef<number>(0)
  const voiceRef = useRef<ReturnType<typeof useVoice> | null>(null)

  const voice = useVoice({
    onTranscript: async (text) => {
      const durationSeconds = Math.max(
        1,
        Math.round((Date.now() - turnStartRef.current) / 1000)
      )

      try {
        const result = await onSend(text)
        const aiResponse = result?.response ?? ""
        const chatLogId = result?.chatLogId

        if (aiResponse) {
          setResponse(aiResponse)

          if (chatLogId) {
            try {
              await fetch("/api/ai/voice-log", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  chatLogId,
                  durationSeconds,
                  sttText: text,
                }),
              })
            } catch (logError) {
              console.error("Failed to save voice log:", logError)
            }
          }

          await voiceRef.current?.speak(aiResponse)
        }
      } catch (error) {
        console.error("Voice conversation error:", error)
        const fallback =
          "I'm sorry, I couldn't process that. Please try again."
        setResponse(fallback)
        await voiceRef.current?.speak(fallback)
      }
    },
    onStateChange: (state) => {
      if (state === "idle" && autoLoop) {
        window.setTimeout(() => {
          turnStartRef.current = Date.now()
          voiceRef.current?.startListening()
        }, 400)
      }
    },
  })

  useEffect(() => {
    voiceRef.current = voice
  }, [voice])

  const autoStartedRef = useRef(false)
  useEffect(() => {
    if (autoStart && !autoStartedRef.current) {
      autoStartedRef.current = true
      turnStartRef.current = Date.now()
      
      // Small delay ensures UI is fully mounted and ready for permission prompt if needed
      setTimeout(() => {
        voiceRef.current?.startListening()
      }, 100)
    }
  }, [autoStart])

  const handleMicClick = useCallback(() => {
    if (voice.state === "listening") {
      voice.stopListening()
    } else {
      turnStartRef.current = Date.now()
      voice.startListening()
    }
  }, [voice])

  const isBusy = voice.state === "thinking" || voice.state === "speaking"

  return (
    <div className="flex h-full flex-col items-center justify-between p-5 text-center">
      <div className="flex flex-1 flex-col items-center justify-center gap-5">
        <div className="relative flex items-center justify-center">
          <VoiceOrb state={voice.state} />
        </div>

        <div className="min-h-[100px] w-full max-w-[260px] space-y-2">
          <AnimatePresence mode="wait">
            {voice.state === "listening" && (
              <motion.div
                key="listening"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-lg font-medium text-foreground">
                  {voice.transcript || "Listening..."}
                </p>
                <p className="text-xs text-muted-foreground">
                  Speak clearly and tap the mic when done
                </p>
              </motion.div>
            )}

            {voice.state === "thinking" && (
              <motion.div
                key="thinking"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-base font-medium text-foreground">
                  Processing your request...
                </p>
                <p className="text-xs text-muted-foreground">
                  {voice.transcript}
                </p>
              </motion.div>
            )}

            {voice.state === "speaking" && response && (
              <motion.div
                key="speaking"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-base font-medium leading-relaxed text-foreground">
                  {response}
                </p>
              </motion.div>
            )}

            {voice.state === "idle" && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-1"
              >
                <p className="font-heading text-lg font-semibold">
                  {stateLabel(voice.state)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Ask about products, orders, or returns
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex w-full flex-col items-center gap-4">
        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            size="icon-lg"
            className={`h-16 w-16 rounded-full shadow-xl transition-all ${
              voice.state === "listening"
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
            onClick={handleMicClick}
            disabled={isBusy}
            aria-label={
              voice.state === "listening"
                ? "Stop listening"
                : "Start listening"
            }
          >
            {voice.state === "listening" ? (
              <MicOff className="size-6" />
            ) : (
              <Mic className="size-6" />
            )}
          </Button>
        </motion.div>

        <div className="flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={autoLoop}
              onChange={(e) => setAutoLoop(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-input accent-primary"
            />
            Auto-listen after speaking
          </label>

          <button
            type="button"
            onClick={() => voice.stopSpeaking()}
            disabled={voice.state !== "speaking"}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-40"
            aria-label="Stop speaking"
          >
            <RefreshCw className="size-3" />
            Stop
          </button>
        </div>

        {!voice.isSupported && (
          <p className="max-w-[260px] text-xs text-destructive">
            Voice recognition is not supported in this browser. For the best
            experience, use Chrome or Edge.
          </p>
        )}
      </div>
    </div>
  )
}
