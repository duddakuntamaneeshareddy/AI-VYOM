"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Package,
  RefreshCw,
  Send,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AIAnalysisCard } from "@/components/returns/ai-analysis-card"
import { cn } from "@/lib/utils"
import type { Product, OrderItem } from "@/lib/db/types"
import type { ReturnAnalysis } from "@/app/api/returns/analyze/route"

const RETURN_REASONS = [
  { value: "damaged", label: "Damaged" },
  { value: "wrong_item", label: "Wrong item" },
  { value: "not_as_described", label: "Not as described" },
  { value: "changed_mind", label: "Changed mind" },
  { value: "quality_issue", label: "Quality issue" },
  { value: "other", label: "Other" },
]

interface ReturnFormProps {
  orderId: string
  items: (OrderItem & { product: Product })[]
}

export function ReturnForm({ orderId, items }: ReturnFormProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [selectedItemId, setSelectedItemId] = useState<string>("")
  const [reason, setReason] = useState("")
  const [description, setDescription] = useState("")
  const [analysis, setAnalysis] = useState<ReturnAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedItem = items.find((item) => item.id === selectedItemId)
  const totalSteps = 5

  async function runAIAnalysis() {
    if (!selectedItem) return

    setIsAnalyzing(true)
    setError(null)

    try {
      const response = await fetch("/api/returns/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: `${reason}${description ? `: ${description}` : ""}`,
          orderItem: {
            product_name: selectedItem.product.name,
            price: selectedItem.price_at_purchase,
            quantity: selectedItem.quantity,
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to analyze return")
      }

      setAnalysis(data.analysis as ReturnAnalysis)
      setStep(4)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed")
    } finally {
      setIsAnalyzing(false)
    }
  }

  async function submitReturn() {
    if (!selectedItem || !analysis) return

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: orderId,
          order_item_id: selectedItem.id,
          reason: `${reason}${description ? `: ${description}` : ""}`,
          ai_analysis: analysis,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to submit return")
      }

      setStep(5)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleNext() {
    if (step === 3) {
      runAIAnalysis()
    } else if (step === 4) {
      submitReturn()
    } else {
      setStep((s) => Math.min(s + 1, totalSteps))
    }
  }

  function handleBack() {
    if (step === 4 && isAnalyzing) return
    setStep((s) => Math.max(s - 1, 1))
  }

  function canProceed() {
    switch (step) {
      case 1:
        return !!selectedItemId
      case 2:
        return !!reason
      case 3:
        return description.trim().length >= 10
      case 4:
        return !!analysis && !isAnalyzing
      default:
        return false
    }
  }

  const stepLabels = [
    "Select Item",
    "Reason",
    "Description",
    "AI Analysis",
    "Submit",
  ]

  return (
    <div className="glass-card overflow-hidden">
      <div className="border-b border-border/50 bg-muted/30 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold">
            Return Request
          </h2>
          <span className="text-xs text-muted-foreground">
            Step {step} of {totalSteps}
          </span>
        </div>
        <div className="mt-3 flex items-center gap-1">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div
              key={index}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors duration-300",
                index < step ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>
        <div className="mt-2 hidden gap-2 text-xs text-muted-foreground sm:flex">
          {stepLabels.map((label, index) => (
            <span
              key={label}
              className={cn(
                "flex-1 text-center transition-colors",
                index + 1 === step && "font-medium text-foreground"
              )}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="relative min-h-[360px] p-6">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <div>
                <h3 className="font-heading text-xl font-bold">
                  Select an item to return
                </h3>
                <p className="text-sm text-muted-foreground">
                  Choose the product you want to return from this order.
                </p>
              </div>

              <div className="grid gap-3">
                {items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedItemId(item.id)}
                    className={cn(
                      "surface-bento flex items-center gap-4 text-left transition-all",
                      selectedItemId === item.id
                        ? "border-primary ring-2 ring-primary/20"
                        : "surface-bento-hover"
                    )}
                  >
                    <div
                      className={cn(
                        "flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                        selectedItemId === item.id
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted"
                      )}
                    >
                      {selectedItemId === item.id && (
                        <Check className="size-3.5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-heading font-semibold">
                        {item.product.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ${item.price_at_purchase.toFixed(2)} x {item.quantity}
                      </p>
                    </div>
                    <div className="text-sm font-bold">
                      ${(item.price_at_purchase * item.quantity).toFixed(2)}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <div>
                <h3 className="font-heading text-xl font-bold">
                  Why are you returning this item?
                </h3>
                <p className="text-sm text-muted-foreground">
                  Select the reason that best describes your return.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Return reason</Label>
                <Select
                  value={reason}
                  onValueChange={(value) => setReason(value ?? "")}
                >
                  <SelectTrigger
                    id="reason"
                    className="w-full data-[size=default]:h-10"
                  >
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {RETURN_REASONS.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedItem && (
                <div className="surface-bento flex items-center gap-3">
                  <Package className="size-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{selectedItem.product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      ${selectedItem.price_at_purchase.toFixed(2)} x{" "}
                      {selectedItem.quantity}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <div>
                <h3 className="font-heading text-xl font-bold">
                  Describe the issue
                </h3>
                <p className="text-sm text-muted-foreground">
                  Add details to help us understand your return request.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  Description{" "}
                  <span className="text-xs text-muted-foreground">
                    (min. 10 characters)
                  </span>
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please describe what happened with the item..."
                  className="min-h-[140px]"
                />
              </div>

              <p className="text-xs text-muted-foreground">
                Selected reason:{" "}
                <span className="font-medium text-foreground">
                  {RETURN_REASONS.find((r) => r.value === reason)?.label}
                </span>
              </p>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <div>
                <h3 className="font-heading text-xl font-bold">
                  AI Analysis
                </h3>
                <p className="text-sm text-muted-foreground">
                  Our AI has reviewed your return request.
                </p>
              </div>

              <AIAnalysisCard analysis={analysis} isLoading={isAnalyzing} />

              {!isAnalyzing && analysis && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="surface-bento bg-primary/5"
                >
                  <div className="flex items-start gap-3">
                    <RefreshCw className="mt-0.5 size-4 text-primary" />
                    <div>
                      <p className="font-medium">What happens next?</p>
                      <p className="text-sm text-muted-foreground">
                        Your request will be submitted for review. If approved,
                        you&apos;ll receive a refund or replacement based on the AI
                        suggestion.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex h-full flex-col items-center justify-center py-8 text-center"
            >
              <div className="flex size-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <Check className="size-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="mt-4 font-heading text-2xl font-bold">
                Return Submitted
              </h3>
              <p className="mt-2 max-w-md text-muted-foreground">
                Your return request has been received and is being reviewed.
                You&apos;ll be notified once a decision is made.
              </p>
              <div className="mt-6 flex gap-3">
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => router.push("/returns")}
                >
                  View My Returns
                </Button>
                <Button
                  className="rounded-full"
                  onClick={() => router.push(`/orders/${orderId}`)}
                >
                  Back to Order
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {step < 5 && (
        <div className="flex items-center justify-between border-t border-border/50 px-6 py-4">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full"
            onClick={handleBack}
            disabled={step === 1 || isAnalyzing || isSubmitting}
          >
            <ArrowLeft className="mr-2 size-4" />
            Back
          </Button>

          <div className="flex items-center gap-3">
            {error && (
              <p className="hidden max-w-[200px] text-right text-xs text-destructive sm:block">
                {error}
              </p>
            )}
            <Button
              className="rounded-full"
              onClick={handleNext}
              disabled={!canProceed() || isSubmitting}
            >
              {isAnalyzing ? (
                <>
                  Analyzing...
                  <RefreshCw className="ml-2 size-4 animate-spin" />
                </>
              ) : isSubmitting ? (
                <>
                  Submitting...
                  <RefreshCw className="ml-2 size-4 animate-spin" />
                </>
              ) : step === 4 ? (
                <>
                  Submit Return
                  <Send className="ml-2 size-4" />
                </>
              ) : step === 3 ? (
                <>
                  Analyze with AI
                  <RefreshCw className="ml-2 size-4" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="ml-2 size-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
