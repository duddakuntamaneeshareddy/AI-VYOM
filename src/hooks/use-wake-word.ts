"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { createSpeechRecognition, isSpeechRecognitionSupported } from "@/lib/stt/web-speech"

export interface UseWakeWordOptions {
  onDetected: () => void
  enabled: boolean
}

// Common phonetic misspellings of "Hey Vyom"
const WAKE_WORD_PATTERNS = [
  "hey vyom",
  "hey viom",
  "hey biom",
  "hey veom",
  "hey v yum",
  "hey v yom",
  "hey vium",
  "hey be on",
  "hey wyom",
  "hey wom",
  "hey vom",
  "hey wiom"
]

export function useWakeWord({ onDetected, enabled }: UseWakeWordOptions) {
  const [isListening, setIsListening] = useState(false)
  
  // Use a state to store isSupported so it matches client-side execution safely
  const [isSupported, setIsSupported] = useState(false)
  useEffect(() => {
    setIsSupported(isSpeechRecognitionSupported())
  }, [])

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const enabledRef = useRef(enabled)
  const onDetectedRef = useRef(onDetected)

  useEffect(() => {
    enabledRef.current = enabled
    onDetectedRef.current = onDetected
  }, [enabled, onDetected])

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null // Prevent auto-restart loop
        recognitionRef.current.stop()
      } catch (e) {}
      recognitionRef.current = null
    }
    setIsListening(false)
  }, [])

  const start = useCallback(() => {
    if (!isSupported || !enabledRef.current) return
    if (recognitionRef.current) return

    const recognition = createSpeechRecognition()
    if (!recognition) return

    recognition.continuous = true
    recognition.interimResults = true

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event) => {
      if (!enabledRef.current) return

      let transcript = ""
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }
      
      const normalized = transcript.toLowerCase().replace(/[.,!?]/g, "")
      
      const detected = WAKE_WORD_PATTERNS.some(pattern => normalized.includes(pattern))

      if (detected) {
        stop()
        onDetectedRef.current()
      }
    }

    recognition.onerror = (event) => {
      if (event.error === "aborted" || event.error === "not-allowed") {
        return // User denied or it was manually aborted
      }
    }

    recognition.onend = () => {
      setIsListening(false)
      recognitionRef.current = null
      
      // Auto-restart to keep listening
      if (enabledRef.current) {
        setTimeout(() => start(), 300)
      }
    }

    try {
      recognitionRef.current = recognition
      recognition.start()
    } catch (e) {
      console.error("Failed to start wake word listener:", e)
      recognitionRef.current = null
      setIsListening(false)
    }
  }, [isSupported, stop])

  useEffect(() => {
    if (enabled && isSupported) {
      start()
    } else {
      stop()
    }
    return () => stop()
  }, [enabled, isSupported, start, stop])

  return {
    isListening,
    isSupported,
  }
}
