"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, Loader2, Star } from "lucide-react"
import ReactMarkdown from "react-markdown"
import type { Components } from "react-markdown"
import type { User } from "@supabase/supabase-js"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { ProductAddToCart } from "./product-add-to-cart"
import { AIRecommendations } from "./ai-recommendations"
import { VisibleProductsRegistrar } from "./visible-products-registrar"
import { toast } from "sonner"
import type { Product, ProductReview } from "@/lib/db/types"

interface ProductDetailContentProps {
  product: Product
  user: User | null
  initialReviews: ProductReview[]
}

const descriptionMarkdownComponents: Components = {
  p({ children }) {
    return <p className="my-2 leading-relaxed">{children}</p>
  },
  strong({ children }) {
    return <strong className="font-semibold text-foreground">{children}</strong>
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
    return <ul className="list-disc pl-4 space-y-0.5 my-2">{children}</ul>
  },
  ol({ children }) {
    return <ol className="list-decimal pl-4 space-y-0.5 my-2">{children}</ol>
  },
  li({ children }) {
    return <li>{children}</li>
  },
  a({ children, href }) {
    return (
      <a
        href={href}
        className="text-primary underline underline-offset-2 hover:opacity-80"
      >
        {children}
      </a>
    )
  },
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(months / 12)}y ago`
}

function getReviewerDisplayName(
  review: ProductReview
): string {
  if (review.profiles?.full_name) {
    return review.profiles.full_name
  }
  const email = review.profiles?.email
  if (email) {
    return email.split("@")[0]
  }
  return "Anonymous"
}

function StarRating({
  rating,
  max = 5,
  size = 16,
  label,
}: {
  rating: number
  max?: number
  size?: number
  label?: string
}) {
  const fullStars = Math.floor(rating)
  const hasHalf = rating - fullStars >= 0.5

  return (
    <div
      className="inline-flex items-center gap-0.5"
      role="img"
      aria-label={label ?? `${rating} out of ${max} stars`}
    >
      {Array.from({ length: max }).map((_, i) => {
        const isFilled = i < fullStars || (i === fullStars && hasHalf)
        return (
          <Star
            key={i}
            size={size}
            className={`${
              isFilled ? "fill-amber-400 text-amber-400" : "fill-transparent text-muted-foreground/40"
            }`}
            aria-hidden="true"
          />
        )
      })}
    </div>
  )
}

function StarRatingInput({
  value,
  onChange,
  error,
}: {
  value: number
  onChange: (rating: number) => void
  error?: string
}) {
  const [hover, setHover] = React.useState(0)

  return (
    <fieldset>
      <legend className="text-sm font-medium text-foreground mb-2">
        Your rating
      </legend>
      <div className="flex items-center gap-1" role="radiogroup" aria-label="Your rating">
        {Array.from({ length: 5 }).map((_, i) => {
          const ratingValue = i + 1
          const isSelected = ratingValue === value
          return (
            <button
              key={ratingValue}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={`${ratingValue} star${ratingValue > 1 ? "s" : ""}`}
              onClick={() => onChange(ratingValue)}
              onMouseEnter={() => setHover(ratingValue)}
              onMouseLeave={() => setHover(0)}
              onFocus={() => setHover(ratingValue)}
              onBlur={() => setHover(0)}
              className="p-1.5 rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Star
                size={24}
                className={`${
                  ratingValue <= (hover || value)
                    ? "fill-amber-400 text-amber-400"
                    : "fill-transparent text-muted-foreground/40"
                } transition-colors`}
              />
            </button>
          )
        })}
      </div>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </fieldset>
  )
}

function StockIndicator({ stock }: { stock: number }) {
  if (stock <= 0) {
    return (
      <Badge variant="outline" className="w-fit text-destructive border-destructive/30 bg-destructive/10">
        Out of stock
      </Badge>
    )
  }

  if (stock <= 10) {
    return (
      <Badge variant="outline" className="w-fit text-amber-600 border-amber-500/30 bg-amber-500/10 dark:text-amber-400">
        Only {stock} left
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className="w-fit text-green-600 border-green-500/30 bg-green-500/10 dark:text-green-400">
      In stock ({stock} available)
    </Badge>
  )
}

function SpecificationsTable({
  specifications,
}: {
  specifications: Record<string, string> | null
}) {
  const entries = specifications ? Object.entries(specifications) : []
  if (entries.length === 0) return null

  return (
    <div className="surface-bento">
      <h2 className="font-heading text-xl font-semibold">Specifications</h2>
      <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {entries.map(([key, value]) => (
          <div
            key={key}
            className="glass-card rounded-xl px-4 py-3"
          >
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {key}
            </dt>
            <dd className="mt-0.5 text-sm font-medium text-foreground">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function ReviewForm({
  productId,
  onSuccess,
}: {
  productId: string
  onSuccess: () => void
}) {
  const [rating, setRating] = React.useState(0)
  const [comment, setComment] = React.useState("")
  const [ratingError, setRatingError] = React.useState<string>()
  const [commentError, setCommentError] = React.useState<string>()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setRatingError(undefined)
    setCommentError(undefined)

    let valid = true
    if (rating < 1 || rating > 5) {
      setRatingError("Please select a star rating")
      valid = false
    }
    if (comment.trim().length === 0) {
      setCommentError("Please write a comment")
      valid = false
    }
    if (!valid) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment: comment.trim() }),
      })

      const data = (await response.json()) as { error?: string }

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit review")
      }

      toast.success("Review submitted")
      setRating(0)
      setComment("")
      onSuccess()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit review")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="surface-bento">
      <h3 className="font-heading text-lg font-semibold">Write a review</h3>
      <div className="mt-4 space-y-4">
        <StarRatingInput
          value={rating}
          onChange={setRating}
          error={ratingError}
        />
        <div>
          <label htmlFor="review-comment" className="text-sm font-medium text-foreground">
            Your review
          </label>
          <Textarea
            id="review-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What did you like or dislike?"
            className="mt-1.5 min-h-[100px]"
            aria-invalid={!!commentError}
            aria-describedby={commentError ? "comment-error" : undefined}
          />
          {commentError && (
            <p id="comment-error" className="mt-1 text-xs text-destructive">
              {commentError}
            </p>
          )}
        </div>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full"
        >
          {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
          Submit review
        </Button>
      </div>
    </form>
  )
}

function ReviewsSection({
  productId,
  user,
  initialReviews,
}: {
  productId: string
  user: User | null
  initialReviews: ProductReview[]
}) {
  const [reviews, setReviews] = React.useState<ProductReview[]>(initialReviews)
  const [isLoading, setIsLoading] = React.useState(false)

  const fetchReviews = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/products/${productId}/reviews`)
      if (!response.ok) throw new Error("Failed to fetch reviews")
      const data = (await response.json()) as { reviews: ProductReview[] }
      setReviews(data.reviews)
    } catch (err) {
      console.error("Fetch reviews error:", err)
    } finally {
      setIsLoading(false)
    }
  }, [productId])

  React.useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  const averageRating = React.useMemo(() => {
    if (reviews.length === 0) return 0
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
    return Math.round((sum / reviews.length) * 10) / 10
  }, [reviews])

  return (
    <section className="surface-bento" aria-labelledby="reviews-heading">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="reviews-heading" className="font-heading text-2xl font-semibold">
            Customer reviews
          </h2>
          <div className="mt-2 flex items-center gap-2">
            <StarRating rating={averageRating} size={20} />
            <span className="text-sm text-muted-foreground">
              {averageRating > 0
                ? `${averageRating.toFixed(1)} · ${reviews.length} review${reviews.length === 1 ? "" : "s"}`
                : "No reviews yet"}
            </span>
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      {isLoading && reviews.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      ) : reviews.length === 0 ? (
        <p className="py-4 text-muted-foreground">
          No reviews yet — be the first.
        </p>
      ) : (
        <ul className="space-y-4">
          {reviews.map((review) => (
            <li
              key={review.id}
              className="glass-card rounded-xl px-4 py-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-foreground">
                    {getReviewerDisplayName(review)}
                  </p>
                  <StarRating
                    rating={review.rating}
                    size={14}
                    label={`Rated ${review.rating} out of 5 stars`}
                  />
                </div>
                <time
                  dateTime={review.created_at}
                  className="shrink-0 text-xs text-muted-foreground"
                >
                  {formatRelativeTime(review.created_at)}
                </time>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-foreground/90">
                {review.comment}
              </p>
            </li>
          ))}
        </ul>
      )}

      <Separator className="my-6" />

      {user ? (
        <ReviewForm productId={productId} onSuccess={fetchReviews} />
      ) : (
        <div className="glass-card rounded-xl px-4 py-6 text-center">
          <p className="text-sm text-muted-foreground">
            Please{" "}
            <Link
              href="/login"
              className="font-medium text-primary underline underline-offset-2 hover:opacity-80"
            >
              log in
            </Link>{" "}
            to leave a review.
          </p>
        </div>
      )}
    </section>
  )
}

export function ProductDetailContent({
  product,
  user,
  initialReviews,
}: ProductDetailContentProps) {
  const imageRef = React.useRef<HTMLDivElement>(null)
  const hasDescription = product.description && product.description.trim().length > 0
  const hasSpecifications =
    product.specifications && Object.keys(product.specifications).length > 0

  return (
    <>
      <VisibleProductsRegistrar products={[product]} />
      <Link href="/products">
        <Button variant="ghost" size="sm" className="mb-6 rounded-full">
          <ArrowLeft className="mr-2 size-4" />
          Back to products
        </Button>
      </Link>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="surface-bento overflow-hidden"
        >
          <div ref={imageRef} className="relative aspect-square">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No image
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="flex flex-col"
        >
          <Badge variant="outline" className="w-fit">
            {product.category}
          </Badge>
          <h1 className="mt-4 font-heading text-3xl font-bold sm:text-4xl">
            {product.name}
          </h1>
          <p className="mt-2 text-2xl font-bold text-primary">
            ${product.price.toFixed(2)}
          </p>

          <div className="mt-4 flex items-center gap-2">
            <StockIndicator stock={product.stock} />
          </div>

          {hasDescription && (
            <div className="mt-6 text-muted-foreground">
              <ReactMarkdown components={descriptionMarkdownComponents}>
                {product.description!}
              </ReactMarkdown>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          <Separator className="my-8" />

          <ProductAddToCart product={product} imageRef={imageRef} />
        </motion.div>
      </div>

      {hasSpecifications && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-8"
        >
          <SpecificationsTable specifications={product.specifications} />
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-8"
      >
        <ReviewsSection
          productId={product.id}
          user={user}
          initialReviews={initialReviews}
        />
      </motion.div>

      <AIRecommendations productId={product.id} />
    </>
  )
}
