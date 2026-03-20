"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Search, FileText, Loader2, Sparkles } from "lucide-react"
import type { AnalysisResult } from "@/lib/analysis-engine"

const SAMPLE_TEXTS = [
  {
    label: "AI-Generated Text",
    text: `Climate change is fundamentally one of the most pressing challenges facing humanity today. Furthermore, the scientific community has reached a consensus that human activities are the primary drivers of global warming. It is important to note that greenhouse gas emissions have increased significantly over the past century. Moreover, this demonstrates the urgent need for immediate action. In conclusion, governments and individuals must work together to implement sustainable solutions. Additionally, renewable energy sources offer promising alternatives to fossil fuels. The evidence clearly shows that we must act now to protect our planet for future generations.`
  },
  {
    label: "Plagiarism Pattern",
    text: `The water cycle is essential for life on Earth. Water evaporates from oceans and lakes. The water vapor rises into the atmosphere. The water cycle is important for all living things. Water condenses into clouds in the sky. The water then falls as precipitation. The water cycle continues endlessly on our planet. Water flows back to the oceans through rivers. The water cycle is a continuous natural process. Water is recycled through this cycle constantly.`
  },
  {
    label: "AI Rewritten Text",
    text: `The implementation of educational technology has fundamentally transformed modern learning environments. Schools must utilize digital tools to facilitate student engagement effectively. Subsequently, educators endeavor to ascertain the best methods for demonstration of complex concepts. The aforementioned strategies have shown approximately significant improvements in student outcomes. Nevertheless, it is worth noting that traditional teaching methods still hold substantial value. Teachers should implement these innovations comprehensively to enhance the overall learning experience.`
  }
]

interface TextSubmissionProps {
  onAnalysisComplete: (result: AnalysisResult, text: string) => void
}

export function TextSubmission({ onAnalysisComplete }: TextSubmissionProps) {
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const wordCount = text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length
  const charCount = text.length

  async function handleAnalyze() {
    if (text.trim().length < 50) {
      setError("Please enter at least 50 characters for a meaningful analysis.")
      return
    }

    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Analysis failed")
      }

      const result = await res.json()
      onAnalysisComplete(result, text)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">Submit Your Text</CardTitle>
            <CardDescription>
              Paste an essay, report, or assignment below for analysis
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value)
              if (error) setError("")
            }}
            placeholder="Paste your essay or assignment text here..."
            className="min-h-[280px] w-full resize-y rounded-lg border border-input bg-background p-4 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            disabled={loading}
          />
          <div className="absolute bottom-3 right-3 flex items-center gap-3 text-xs text-muted-foreground">
            <span>{wordCount} words</span>
            <span>{charCount} characters</span>
          </div>
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Sparkles className="h-3 w-3" />
              Try samples:
            </span>
            {SAMPLE_TEXTS.map((sample) => (
              <Button
                key={sample.label}
                variant="outline"
                size="sm"
                onClick={() => setText(sample.text)}
                disabled={loading}
                className="h-7 text-xs"
              >
                {sample.label}
              </Button>
            ))}
          </div>
          
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Minimum 50 characters required for analysis
            </p>
            <Button
              onClick={handleAnalyze}
              disabled={loading || text.trim().length < 50}
              className="gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Analyze Submission
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}