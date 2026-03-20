"use client"

import { Lightbulb, PenLine } from "lucide-react"

interface WritingSuggestionsProps {
  suggestions: string[]
  stats: {
    totalSentences: number
    totalWords: number
    uniqueWords: number
    avgSentenceLength: number
    lexicalDiversity: number
    sentenceLengthVariance: number
  }
}

export function WritingSuggestions({ suggestions, stats }: WritingSuggestionsProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Stats overview */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="mb-4 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <PenLine className="h-4 w-4 text-primary" />
          </div>
          <p className="text-sm font-medium text-foreground">Writing Statistics</p>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <div className="flex flex-col gap-0.5">
            <p className="text-lg font-bold text-foreground">{stats.totalWords}</p>
            <p className="text-xs text-muted-foreground">Total Words</p>
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="text-lg font-bold text-foreground">{stats.totalSentences}</p>
            <p className="text-xs text-muted-foreground">Sentences</p>
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="text-lg font-bold text-foreground">{stats.uniqueWords}</p>
            <p className="text-xs text-muted-foreground">Unique Words</p>
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="text-lg font-bold text-foreground">{stats.avgSentenceLength}</p>
            <p className="text-xs text-muted-foreground">Avg Words/Sentence</p>
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="text-lg font-bold text-foreground">
              {Math.round(stats.lexicalDiversity * 100)}%
            </p>
            <p className="text-xs text-muted-foreground">Lexical Diversity</p>
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="text-lg font-bold text-foreground">{stats.sentenceLengthVariance}</p>
            <p className="text-xs text-muted-foreground">Length Variance</p>
          </div>
        </div>
      </div>

      {/* Suggestions */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="mb-4 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
            <Lightbulb className="h-4 w-4 text-accent" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              Writing Improvement Suggestions
            </p>
            <p className="text-xs text-muted-foreground">
              Constructive feedback to improve authenticity
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          {suggestions.map((suggestion, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 rounded-lg bg-secondary/50 p-3"
            >
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {idx + 1}
              </span>
              <p className="text-sm leading-relaxed text-foreground/90">
                {suggestion}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
