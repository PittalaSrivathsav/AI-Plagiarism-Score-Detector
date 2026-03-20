"use client"

import type { SentenceFlag } from "@/lib/analysis-engine"
import { cn } from "@/lib/utils"
import { AlertTriangle, Copy, Bot, AlertOctagon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface FlaggedSentencesProps {
  flaggedSentences: SentenceFlag[]
}

function getTypeIcon(type: SentenceFlag["type"]) {
  switch (type) {
    case "plagiarism":
      return <Copy className="h-4 w-4" />
    case "ai":
      return <Bot className="h-4 w-4" />
    case "rewrite":
      return <AlertTriangle className="h-4 w-4" />
  }
}

function getTypeLabel(type: SentenceFlag["type"]) {
  switch (type) {
    case "plagiarism":
      return "Possible Plagiarism"
    case "ai":
      return "AI Writing Pattern"
    case "rewrite":
      return "AI Paraphrasing"
  }
}

function getContainerStyles(type: SentenceFlag["type"], severity: SentenceFlag["severity"]) {
  // Red background for plagiarism/high severity, Yellow for AI patterns
  if (type === "plagiarism" || severity === "high") {
    return "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900"
  }
  return "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-900"
}

function getIconStyles(type: SentenceFlag["type"], severity: SentenceFlag["severity"]) {
  if (type === "plagiarism" || severity === "high") {
    return "text-red-600 dark:text-red-400"
  }
  return "text-yellow-600 dark:text-yellow-400"
}

function getTypeBadgeStyles(type: SentenceFlag["type"]) {
  switch (type) {
    case "plagiarism":
      return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800"
    case "ai":
      return "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-800"
    case "rewrite":
      return "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-800"
  }
}

function getSeverityBadgeStyles(severity: SentenceFlag["severity"]) {
  switch (severity) {
    case "high":
      return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
    case "medium":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300"
    case "low":
      return "bg-secondary text-muted-foreground"
  }
}

export function FlaggedSentences({ flaggedSentences }: FlaggedSentencesProps) {
  if (flaggedSentences.length === 0) {
    return (
      <Card className="border-border">
        <CardContent className="flex flex-col items-center gap-3 py-12">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <svg
              className="h-7 w-7 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-base font-medium text-foreground">No Suspicious Sections Found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              The submitted text did not trigger any flags.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
            <AlertOctagon className="h-4 w-4 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <CardTitle className="text-base">Suspicious Sections</CardTitle>
            <CardDescription>
              {flaggedSentences.length} section{flaggedSentences.length !== 1 ? "s" : ""} flagged for review
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {flaggedSentences.map((flag, idx) => (
          <div
            key={idx}
            className={cn(
              "flex flex-col gap-3 rounded-xl border p-4 transition-all",
              getContainerStyles(flag.type, flag.severity)
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn("mt-0.5", getIconStyles(flag.type, flag.severity))}>
                {getTypeIcon(flag.type)}
              </div>
              <div className="flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                      getTypeBadgeStyles(flag.type)
                    )}
                  >
                    {getTypeLabel(flag.type)}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                      getSeverityBadgeStyles(flag.severity)
                    )}
                  >
                    {flag.severity} severity
                  </span>
                </div>
                <div className="mb-2 rounded-lg bg-card/80 p-3">
                  <p className="text-sm leading-relaxed text-foreground">
                    {'"'}{flag.sentence}{'"'}
                  </p>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  <span className="font-medium">Reason:</span> {flag.reason}
                </p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
