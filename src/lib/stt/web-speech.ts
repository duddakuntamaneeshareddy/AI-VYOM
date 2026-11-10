"use client"

export function isSpeechRecognitionSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  )
}

export function createSpeechRecognition(): SpeechRecognition | null {
  if (typeof window === "undefined") return null

  const Constructor =
    window.SpeechRecognition || window.webkitSpeechRecognition

  if (!Constructor) return null

  const recognition = new Constructor()
  recognition.continuous = false
  recognition.interimResults = true
  recognition.lang = "en-US"
  recognition.maxAlternatives = 1

  return recognition
}
