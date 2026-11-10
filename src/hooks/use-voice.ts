"use client"

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react"

import { stripMarkdown } from "@/lib/ai/strip-markdown"
import {
  createSpeechRecognition,
  isSpeechRecognitionSupported,
} from "@/lib/stt/web-speech"

export type VoiceState = "idle" | "listening" | "thinking" | "speaking"

export interface UseVoiceOptions {
  onTranscript?: (text: string) => void
  onAIResponse?: (text: string) => void
  onStateChange?: (state: VoiceState) => void
}

export interface UseVoiceReturn {
  state: VoiceState
  isSupported: boolean
  transcript: string
  startListening: () => void
  stopListening: () => void
  speak: (text: string) => Promise<void>
  stopSpeaking: () => void
}

export function useVoice(options: UseVoiceOptions = {}): UseVoiceReturn {
  const [state, setState] = useState<VoiceState>("idle")
  const [transcript, setTranscript] = useState("")
  const isSupported = useSyncExternalStore(
    () => () => {},
    () => isSpeechRecognitionSupported(),
    () => false
  )

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioUrlRef = useRef<string | null>(null)
  const optionsRef = useRef(options)
  const stateRef = useRef(state)

  useEffect(() => {
    optionsRef.current = options
  })

  useEffect(() => {
    stateRef.current = state
  }, [state])

  const updateState = useCallback((nextState: VoiceState) => {
    setState(nextState)
    optionsRef.current.onStateChange?.(nextState)
  }, [])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch {
        // Recognition may already be stopped.
      }
      recognitionRef.current = null
    }
  }, [])

  const cleanupAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current = null
    }

    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current)
      audioUrlRef.current = null
    }

    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
  }, [])

  const stopSpeaking = useCallback(() => {
    cleanupAudio()

    if (stateRef.current === "speaking") {
      updateState("idle")
    }
  }, [cleanupAudio, updateState])

  const speakWithSpeechSynthesis = useCallback(
    (text: string): Promise<void> => {
      return new Promise((resolve) => {
        if (typeof window === "undefined" || !window.speechSynthesis) {
          resolve()
          return
        }

        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = "en-US"
        utterance.rate = 1
        utterance.pitch = 1

        utterance.onend = () => resolve()
        utterance.onerror = () => resolve()

        window.speechSynthesis.cancel()
        window.speechSynthesis.speak(utterance)
      })
    },
    []
  )

  const speak = useCallback(
    async (text: string) => {
      const cleaned = stripMarkdown(text).trim()
      if (!cleaned) {
        updateState("idle")
        return
      }

      stopListening()
      updateState("speaking")
      optionsRef.current.onAIResponse?.(cleaned)

      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000)

        const response = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: cleaned, voice: "af_bella" }),
          signal: controller.signal,
        })
        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error(`TTS request failed with status ${response.status}`)
        }

        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        audioUrlRef.current = url

        const audio = new Audio(url)
        audioRef.current = audio

        await new Promise<void>((resolve, reject) => {
          audio.onended = () => {
            if (audioUrlRef.current === url) {
              URL.revokeObjectURL(url)
              audioUrlRef.current = null
            }
            audioRef.current = null
            resolve()
          }

          audio.onerror = () => {
            if (audioUrlRef.current === url) {
              URL.revokeObjectURL(url)
              audioUrlRef.current = null
            }
            audioRef.current = null
            reject(new Error("Audio playback failed"))
          }

          audio.play().catch(reject)
        })
      } catch (error) {
        console.warn("Kokoro TTS failed, falling back to SpeechSynthesis:", error)
        await speakWithSpeechSynthesis(cleaned)
      } finally {
        if (stateRef.current === "speaking") {
          updateState("idle")
        }
      }
    },
    [updateState, stopListening, speakWithSpeechSynthesis]
  )

  const startListening = useCallback(() => {
    if (!isSpeechRecognitionSupported()) return

    cleanupAudio()
    stopListening()

    const recognition = createSpeechRecognition()
    if (!recognition) return

    recognitionRef.current = recognition
    setTranscript("")
    updateState("listening")

    recognition.onresult = (event) => {
      let finalTranscript = ""
      let interimTranscript = ""

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const text = result[0]?.transcript ?? ""
        if (result.isFinal) {
          finalTranscript += text
        } else {
          interimTranscript += text
        }
      }

      const displayText = finalTranscript || interimTranscript
      setTranscript(displayText)

      if (finalTranscript) {
        updateState("thinking")
        optionsRef.current.onTranscript?.(finalTranscript)
      }
    }

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error)

      if (event.error === "aborted" || event.error === "no-speech") {
        return
      }

      recognitionRef.current = null
      updateState("idle")
    }

    recognition.onend = () => {
      if (recognitionRef.current === recognition) {
        recognitionRef.current = null
      }
      if (stateRef.current === "listening") {
        updateState("idle")
      }
    }

    try {
      recognition.start()
    } catch (error) {
      console.error("Failed to start speech recognition:", error)
      recognitionRef.current = null
      updateState("idle")
    }
  }, [updateState, stopListening, cleanupAudio])

  useEffect(() => {
    return () => {
      stopListening()
      cleanupAudio()
    }
  }, [stopListening, cleanupAudio])

  return {
    state,
    isSupported,
    transcript,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  }
}
