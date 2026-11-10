"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Plus,
  Trash2,
  Loader2,
  ArrowLeft,
  Package,
  ImageIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import Link from "next/link"

const CATEGORIES = ["Electronics", "Fashion", "Home", "Books", "Sports"]

const PRESET_SPECIFICATIONS = [
  { key: "brand", value: "" },
  { key: "sku", value: "" },
  { key: "weight", value: "" },
  { key: "dimensions", value: "" },
  { key: "material", value: "" },
  { key: "color", value: "" },
  { key: "warranty", value: "" },
]

interface SpecRow {
  key: string
  value: string
}

export default function NewProductPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [category, setCategory] = useState("")
  const [stock, setStock] = useState("0")
  const [tags, setTags] = useState("")
  const [specs, setSpecs] = useState<SpecRow[]>(PRESET_SPECIFICATIONS)

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const previewUrlRef = useRef<string | null>(null)

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current)
      }
    }
  }, [])

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5 MB")
      return
    }

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
    }

    setImageFile(file)
    const previewUrl = URL.createObjectURL(file)
    previewUrlRef.current = previewUrl
    setImagePreview(previewUrl)
  }, [])

  const updateSpec = useCallback((index: number, field: keyof SpecRow, value: string) => {
    setSpecs((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)))
  }, [])

  const addSpecRow = useCallback(() => {
    setSpecs((prev) => [...prev, { key: "", value: "" }])
  }, [])

  const removeSpecRow = useCallback((index: number) => {
    setSpecs((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const buildSpecifications = useCallback(() => {
    const result: Record<string, string> = {}
    for (const row of specs) {
      const key = row.key.trim()
      const value = row.value.trim()
      if (key && value) {
        result[key] = value
      }
    }
    return result
  }, [specs])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!name.trim()) {
      toast.error("Product name is required")
      return
    }
    if (!price || Number.isNaN(Number(price)) || Number(price) < 0) {
      toast.error("Please enter a valid price")
      return
    }
    if (!category) {
      toast.error("Please select a category")
      return
    }

    setIsSubmitting(true)

    let imageUrl: string | undefined

    try {
      if (imageFile) {
        const formData = new FormData()
        formData.append("file", imageFile)

        const uploadRes = await fetch("/api/retailer/upload", {
          method: "POST",
          body: formData,
        })

        const uploadJson = await uploadRes.json()

        if (!uploadRes.ok) {
          throw new Error(uploadJson.error ?? "Image upload failed")
        }

        imageUrl = uploadJson.publicUrl
      }

      const tagsArray = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)

      const productRes = await fetch("/api/retailer/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          price: Number(price),
          category,
          stock: Number(stock) || 0,
          tags: tagsArray,
          image_url: imageUrl,
          specifications: buildSpecifications(),
        }),
      })

      const productJson = await productRes.json()

      if (!productRes.ok) {
        throw new Error(productJson.error ?? "Failed to create product")
      }

      toast.success("Product created successfully")
      router.push("/retailer/products")
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/retailer/products">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="size-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Product</h1>
          <p className="text-muted-foreground">List a new product in your storefront.</p>
        </div>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* Image upload */}
        <section className="surface-bento space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Product Image</Label>
            <span className="text-xs text-muted-foreground">Max 5 MB, images only</span>
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "group relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-muted/30 p-8 transition-colors hover:border-primary/40 hover:bg-muted/50",
              imagePreview && "aspect-video p-0"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleImageChange}
            />

            {imagePreview ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Product preview"
                  className="h-full w-full rounded-2xl object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="font-medium text-white">Change image</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex size-14 items-center justify-center rounded-2xl bg-background shadow-sm">
                  <ImageIcon className="size-7 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="font-medium">Click to upload a product photo</p>
                  <p className="text-sm text-muted-foreground">PNG, JPG, WEBP up to 5 MB</p>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Basic details */}
        <section className="surface-bento space-y-4">
          <h2 className="text-base font-semibold">Basic Details</h2>

          <div className="space-y-2">
            <Label htmlFor="name">
              Product Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g. Wireless Noise-Canceling Headphones"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Write a compelling description. Markdown-friendly."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price">
                Price <span className="text-destructive">*</span>
              </Label>
              <Input
                id="price"
                type="number"
                min={0}
                step={0.01}
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Stock Quantity</Label>
              <Input
                id="stock"
                type="number"
                min={0}
                step={1}
                placeholder="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>
                Category <span className="text-destructive">*</span>
              </Label>
              <Select value={category} onValueChange={(value) => setCategory(value ?? "")}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                placeholder="wireless, audio, premium"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Separate tags with commas.</p>
            </div>
          </div>
        </section>

        {/* Specifications */}
        <section className="surface-bento space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Specifications</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={addSpecRow}
            >
              <Plus className="mr-1.5 size-3.5" />
              Add Row
            </Button>
          </div>

          <div className="space-y-3">
            {specs.map((row, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
              >
                <Input
                  placeholder="Key (e.g. brand)"
                  value={row.key}
                  onChange={(e) => updateSpec(index, "key", e.target.value)}
                />
                <Input
                  placeholder="Value"
                  value={row.value}
                  onChange={(e) => updateSpec(index, "value", e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="rounded-full text-muted-foreground hover:text-destructive"
                  onClick={() => removeSpecRow(index)}
                  aria-label="Remove specification row"
                >
                  <Trash2 className="size-4" />
                </Button>
              </motion.div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Empty rows are ignored. Tip: fill in brand, SKU, weight, dimensions, material, color, and warranty for the best product page.
          </p>
        </section>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/retailer/products">
            <Button type="button" variant="outline" className="rounded-full">
              Cancel
            </Button>
          </Link>
          <Button type="submit" className="rounded-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Package className="mr-2 size-4" />
                Create Product
              </>
            )}
          </Button>
        </div>
      </motion.form>
    </div>
  )
}
