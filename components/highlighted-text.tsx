"use client"

import type { SentenceFlag } from "@/lib/analysis-engine"
import { cn } from "@/lib/utils"

interface HighlightedTextProps {
  text: string
  flaggedSentences: SentenceFlag[]
}

export function HighlightedText({ text, flaggedSentences }: HighlightedTextProps) {
  if (flaggedSentences.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-5">
        <p className="mb-3 text-sm font-medium text-foreground">Analyzed Text</p>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{text}</p>
      </div>
    )
  }

  // Build a highlighted version
  let highlighted = text
  const sortedFlags = [...flaggedSentences].sort(
    (a, b) => b.sentence.length - a.sentence.length
  )

  const replacements: Array<{
    start: number
    end: number
    type: SentenceFlag["type"]
    severity: SentenceFlag["severity"]
  }> = []

  sortedFlags.forEach((flag) => {
    // Try exact match first
    let idx = text.indexOf(flag.sentence)
    
    // If not found, try matching with normalized whitespace
    if (idx === -1) {
      const normalizedSentence = flag.sentence.replace(/\s+/g, " ").trim()
      // Search in normalized text for approximate position
      const normalizedText = text.replace(/\s+/g, " ")
      const normalizedIdx = normalizedText.indexOf(normalizedSentence)
      if (normalizedIdx !== -1) {
        // Find the original position by counting characters
        let originalIdx = 0
        let normalizedCount = 0
        for (let i = 0; i < text.length && normalizedCount < normalizedIdx; i++) {
          if (!/\s/.test(text[i]) || (i > 0 && !/\s/.test(text[i-1]))) {
            normalizedCount++
          }
          originalIdx = i
        }
        idx = originalIdx
      }
    }
    
    if (idx !== -1) {
      // Find the actual end by matching the sentence content
      let endIdx = idx + flag.sentence.length
      // Extend to capture any trailing punctuation
      while (endIdx < text.length && /[.!?]/.test(text[endIdx])) {
        endIdx++
      }
      
      const overlap = replacements.some(
        (r) => idx < r.end && endIdx > r.start
      )
      if (!overlap) {
        replacements.push({
          start: idx,
          end: endIdx,
          type: flag.type,
          severity: flag.severity,
        })
      }
    }
  })

  replacements.sort((a, b) => a.start - b.start)

  const parts: React.ReactNode[] = []
  let lastEnd = 0

  replacements.forEach((r, i) => {
    if (r.start > lastEnd) {
      parts.push(
        <span key={`text-${i}`}>{text.slice(lastEnd, r.start)}</span>
      )
    }

    const bgColor =
      r.type === "plagiarism"
        ? "bg-red-200 dark:bg-red-900/50 border-b-2 border-red-500"
        : r.type === "ai"
          ? "bg-yellow-200 dark:bg-yellow-900/50 border-b-2 border-yellow-500"
          : "bg-orange-200 dark:bg-orange-900/50 border-b-2 border-orange-500"

    const severityLabel = r.severity === "high" ? "High" : r.severity === "medium" ? "Medium" : "Low"
    const typeLabel = r.type === "plagiarism" ? "Plagiarism" : r.type === "ai" ? "AI Pattern" : "AI Rewrite"

    parts.push(
      <span
        key={`flag-${i}`}
        className={cn("rounded-sm px-1 py-0.5 cursor-help transition-colors hover:opacity-80", bgColor)}
        title={`${typeLabel} - ${severityLabel} severity`}
      >
        {text.slice(r.start, r.end)}
      </span>
    )
    lastEnd = r.end
  })

  if (lastEnd < text.length) {
    parts.push(<span key="text-end">{text.slice(lastEnd)}</span>)
  }

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="mb-3 flex items-center gap-4">
        <p className="text-sm font-medium text-foreground">Analyzed Text</p>
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-sm bg-red-300 dark:bg-red-700" />
            Plagiarism
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-sm bg-yellow-300 dark:bg-yellow-700" />
            AI Pattern
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-sm bg-orange-300 dark:bg-orange-700" />
            AI Rewrite
          </span>
        </div>
      </div>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
        {parts}
      </p>
    </div>
  )
}
