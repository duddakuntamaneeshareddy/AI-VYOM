"use client"

import { motion } from "framer-motion"

type OrbState = "idle" | "listening" | "thinking" | "speaking"

interface VoiceOrbProps {
  state: OrbState
}

const stateConfig = {
  idle: {
    size: "w-24 h-24",
    gradient: "from-primary/40 to-primary",
    glow: "bg-primary/25",
    ring: "border-primary/30",
    core: "shadow-primary/50",
    duration: 2,
  },
  listening: {
    size: "w-32 h-32",
    gradient: "from-cyan-400/50 to-cyan-500",
    glow: "bg-cyan-400/30",
    ring: "border-cyan-400/50",
    core: "shadow-cyan-400/50",
    duration: 0.8,
  },
  thinking: {
    size: "w-28 h-28",
    gradient: "from-amber-400/50 to-rose-500",
    glow: "bg-amber-400/30",
    ring: "border-amber-400/50",
    core: "shadow-amber-400/50",
    duration: 1,
  },
  speaking: {
    size: "w-28 h-28",
    gradient: "from-violet-400/50 to-violet-500",
    glow: "bg-violet-400/30",
    ring: "border-violet-400/50",
    core: "shadow-violet-400/50",
    duration: 0.6,
  },
}

export function VoiceOrb({ state }: VoiceOrbProps) {
  const config = stateConfig[state]

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer ambient glow */}
      <motion.div
        animate={{
          scale: [1, 1.25, 1],
          opacity: [0.3, 0.55, 0.3],
        }}
        transition={{
          duration: config.duration,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={`absolute ${config.size} rounded-full blur-2xl ${config.glow}`}
      />

      {/* Listening echo ring */}
      {state === "listening" && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0.6 }}
          animate={{ scale: 1.7, opacity: 0 }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            ease: "easeOut",
          }}
          className="absolute h-32 w-32 rounded-full border-2 border-cyan-400/40"
        />
      )}

      {/* Middle orbital ring — rotates when thinking, pulses otherwise */}
      <motion.div
        animate={
          state === "thinking"
            ? { rotate: 360 }
            : { scale: [1, 1.06, 1], opacity: [0.7, 1, 0.7] }
        }
        transition={
          state === "thinking"
            ? { duration: 1.2, repeat: Infinity, ease: "linear" }
            : {
                duration: config.duration,
                repeat: Infinity,
                ease: "easeInOut",
              }
        }
        className={`absolute ${config.size} rounded-full border-2 ${config.ring}`}
      />

      {/* Inner orb */}
      <motion.div
        animate={{
          scale:
            state === "speaking"
              ? [1, 1.1, 0.96, 1.08, 1]
              : [1, 1.05, 1],
        }}
        transition={{
          duration: state === "speaking" ? 0.55 : config.duration,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={`relative ${config.size} rounded-full bg-gradient-to-br ${config.gradient} shadow-2xl`}
      >
        <motion.div
          animate={{
            opacity: [0.4, 0.85, 0.4],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: config.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`absolute inset-0 rounded-full bg-gradient-to-br ${config.gradient} blur-xl`}
        />

        {/* Core dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={
              state === "speaking"
                ? { scale: [1, 1.3, 1], opacity: [0.9, 1, 0.9] }
                : { scale: [1, 1.15, 1] }
            }
            transition={{
              duration: state === "speaking" ? 0.4 : config.duration,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className={`h-3 w-3 rounded-full bg-white/90 shadow-[0_0_16px_rgba(255,255,255,0.8)] ${config.core}`}
          />
        </div>
      </motion.div>
    </div>
  )
}
