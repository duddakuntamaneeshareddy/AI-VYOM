export function stripMarkdown(text: string): string {
  let out = text

  // Headings: "# Heading" -> "Heading" (remove leading #+ and space)
  out = out.replace(/^#{1,6}\s+/gm, '')

  // Bold + italic: **bold**, *italic*, ***both***, __bold__, _italic_
  out = out.replace(/\*\*\*(.+?)\*\*\*/g, '$1')
  out = out.replace(/\*\*(.+?)\*\*/g, '$1')
  out = out.replace(/__(.+?)__/g, '$1')
  out = out.replace(/(?<!\w)\*(.+?)\*(?!\w)/g, '$1')
  out = out.replace(/(?<!\w)_(.+?)_(?!\w)/g, '$1')

  // Inline code: `code` -> code
  out = out.replace(/`([^`]+)`/g, '$1')

  // Code blocks: ```lang\ncode\n``` -> code (remove fences + lang)
  out = out.replace(/```[\w]*\n?([\s\S]*?)```/g, '$1')

  // Links: [text](url) -> text
  out = out.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')

  // Images: ![alt](url) -> alt
  out = out.replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')

  // Blockquotes: "> quote" -> "quote"
  out = out.replace(/^>\s+/gm, '')

  // Unordered list markers: "- item" or "* item" -> "item"
  out = out.replace(/^[\s]*[-*+]\s+/gm, '')

  // Ordered list markers: "1. item" -> "item"
  out = out.replace(/^\s*\d+\.\s+/gm, '')

  // Horizontal rules: --- or *** or ___ on its own line -> remove
  out = out.replace(/^[-*_]{3,}$/gm, '')

  // Extra: stray asterisks/underscores used as emphasis that weren't caught
  out = out.replace(/\*{2,}/g, '')
  out = out.replace(/_{2,}/g, '')

  // Collapse multiple blank lines into one
  out = out.replace(/\n{3,}/g, '\n\n')

  // Trim trailing/leading whitespace
  return out.trim()
}
