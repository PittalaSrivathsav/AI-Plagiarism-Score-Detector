"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface ScoreMeterProps {
  label: string
  score: number
  description: string
  icon: React.ReactNode
  variant?: "default" | "success"
}

function getScoreColor(score: number, variant?: "success"): string {
  if (variant === "success") return "bg-green-500"
  if (score <= 25) return "bg-green-500"
  if (score <= 50) return "bg-yellow-500"
  if (score <= 75) return "bg-orange-500"
  return "bg-red-500"
}

function getScoreLabel(score: number, variant?: "success"): string {
  if (variant === "success") {
    if (score >= 75) return "Excellent"
    if (score >= 50) return "Good"
    if (score >= 25) return "Fair"
    return "Low"
  }
  if (score <= 25) return "Low Risk"
  if (score <= 50) return "Moderate"
  if (score <= 75) return "High"
  return "Very High"
}

function getScoreLabelColor(score: number, variant?: "success"): string {
  if (variant === "success") return "text-green-600 dark:text-green-400"
  if (score <= 25) return "text-green-600 dark:text-green-400"
  if (score <= 50) return "text-yellow-600 dark:text-yellow-400"
  if (score <= 75) return "text-orange-600 dark:text-orange-400"
  return "text-red-600 dark:text-red-400"
}

export function ScoreMeter({ label, score, description, icon, variant }: ScoreMeterProps) {
  const [animatedScore, setAnimatedScore] = useState(0)
  const [animatedWidth, setAnimatedWidth] = useState(0)

  useEffect(() => {
    // Animate score counting
    const duration = 1000
    const steps = 30
    const increment = score / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= score) {
        setAnimatedScore(score)
        setAnimatedWidth(score)
        clearInterval(timer)
      } else {
        setAnimatedScore(Math.round(current))
        setAnimatedWidth(current)
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [score])

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            {icon}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{label}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold tabular-nums text-foreground">{animatedScore}%</p>
          <p className={cn("text-xs font-medium", getScoreLabelColor(score, variant))}>
            {getScoreLabel(score, variant)}
          </p>
        </div>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={cn("h-full rounded-full transition-all duration-100 ease-out", getScoreColor(score, variant))}
          style={{ width: `${animatedWidth}%` }}
        />
      </div>
    </div>
  )
}
