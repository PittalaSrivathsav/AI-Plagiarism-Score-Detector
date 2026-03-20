"use client"

import type { DetectionReason } from "@/lib/analysis-engine"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, Brain } from "lucide-react"
import { cn } from "@/lib/utils"

interface DetectionReasonsProps {
  reasons: DetectionReason[]
}

export function DetectionReasons({ reasons }: DetectionReasonsProps) {
  const detectedReasons = reasons.filter((r) => r.detected)
  const notDetectedReasons = reasons.filter((r) => !r.detected)

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Brain className="h-4 w-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">Why This Text Was Flagged</CardTitle>
            <CardDescription>
              Detection reasons based on AI writing patterns
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {detectedReasons.length === 0 ? (
            <div className="flex items-center gap-3 rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-300">
                  No major concerns detected
                </p>
                <p className="text-xs text-green-700 dark:text-green-400">
                  The text does not exhibit strong AI-writing patterns.
                </p>
              </div>
            </div>
          ) : (
            <>
              {detectedReasons.map((reason, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "flex items-start gap-3 rounded-lg p-4 transition-all",
                    "bg-red-50 dark:bg-red-900/20"
                  )}
                >
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
                  <div>
                    <p className="text-sm font-medium text-red-800 dark:text-red-300">
                      {reason.title}
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-red-700 dark:text-red-400">
                      {reason.description}
                    </p>
                  </div>
                </div>
              ))}
            </>
          )}

          {notDetectedReasons.length > 0 && detectedReasons.length > 0 && (
            <div className="mt-2 border-t border-border pt-4">
              <p className="mb-3 text-xs font-medium text-muted-foreground">
                Patterns not detected:
              </p>
              <div className="flex flex-wrap gap-2">
                {notDetectedReasons.map((reason, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground"
                  >
                    <CheckCircle2 className="h-3 w-3 text-green-600 dark:text-green-400" />
                    {reason.title}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
