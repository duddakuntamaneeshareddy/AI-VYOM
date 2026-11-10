"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { CampaignSegment, EmailTemplate } from "@/lib/db/types"
import { Loader2, Eye } from "lucide-react"

interface CampaignFormData {
  name: string
  target_segment: CampaignSegment
  template_id: string
}

const SEGMENT_OPTIONS: { value: CampaignSegment; label: string }[] = [
  { value: "all", label: "All customers" },
  { value: "cart_abandoners", label: "Cart abandoners" },
  { value: "recent_buyers", label: "Recent buyers" },
]

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/p>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

interface CampaignFormProps {
  templates: EmailTemplate[]
  onSubmit: (data: CampaignFormData) => void
  isLoading?: boolean
}

export function CampaignForm({
  templates,
  onSubmit,
  isLoading = false,
}: CampaignFormProps) {
  const [name, setName] = React.useState("")
  const [targetSegment, setTargetSegment] = React.useState<CampaignSegment>("all")
  const [templateId, setTemplateId] = React.useState(
    templates[0]?.id ?? ""
  )

  const selectedTemplate = templates.find((t) => t.id === templateId)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit({
      name,
      target_segment: targetSegment,
      template_id: templateId,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="campaign-name">Campaign name</Label>
        <Input
          id="campaign-name"
          placeholder="e.g. July Win-Back Campaign"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="target-segment">Target segment</Label>
        <Select
          value={targetSegment}
          onValueChange={(value) =>
            setTargetSegment((value ?? "all") as CampaignSegment)
          }
        >
          <SelectTrigger id="target-segment" className="w-full">
            <SelectValue placeholder="Select a segment" />
          </SelectTrigger>
          <SelectContent>
            {SEGMENT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email-template">Email template</Label>
        <Select value={templateId} onValueChange={(value) => setTemplateId(value ?? "")}>
          <SelectTrigger id="email-template" className="w-full">
            <SelectValue placeholder="Select a template" />
          </SelectTrigger>
          <SelectContent>
            {templates.map((template) => (
              <SelectItem key={template.id} value={template.id}>
                {template.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedTemplate && (
        <div className="surface-bento space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Eye className="size-4" />
            Template preview
          </div>
          <div className="space-y-1">
            <p className="font-heading font-medium">{selectedTemplate.subject}</p>
            <p className="text-sm text-muted-foreground">
              {stripHtml(selectedTemplate.body).slice(0, 200)}
              {stripHtml(selectedTemplate.body).length > 200 ? "..." : ""}
            </p>
          </div>
        </div>
      )}

      <Button
        type="submit"
        className="w-full rounded-full"
        disabled={isLoading || !name || !templateId}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Creating...
          </>
        ) : (
          "Create Campaign"
        )}
      </Button>
    </form>
  )
}
