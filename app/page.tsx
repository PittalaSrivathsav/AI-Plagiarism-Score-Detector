"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { TextSubmission } from "@/components/text-submission"
import { ResultsDashboard } from "@/components/results-dashboard"
import type { AnalysisResult } from "@/lib/analysis-engine"
import { Shield, Brain, FileSearch, Lightbulb } from "lucide-react"

export default function Home() {
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [analyzedText, setAnalyzedText] = useState("")

  function handleAnalysisComplete(analysisResult: AnalysisResult, text: string) {
    setResult(analysisResult)
    setAnalyzedText(text)
  }

  function handleReset() {
    setResult(null)
    setAnalyzedText("")
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
        {result ? (
          <ResultsDashboard
            result={result}
            text={analyzedText}
            onReset={handleReset}
          />
        ) : (
          <div className="flex flex-col gap-8">
            {/* Hero section */}
            <div className="flex flex-col gap-2 text-center">
              <h2 className="text-balance text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                Detect AI Writing & Plagiarism Instantly
              </h2>
              <p className="mx-auto max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground">
                Paste any student submission to analyze for plagiarism patterns,
                AI-generated content, and AI-rewritten text. Get detailed reports
                with actionable feedback to help improve writing authenticity.
              </p>
            </div>

            {/* Submission form */}
            <TextSubmission onAnalysisComplete={handleAnalysisComplete} />

            {/* Feature cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <FeatureCard
                icon={<Shield className="h-5 w-5 text-primary" />}
                title="Plagiarism Detection"
                description="Detects repeated and overly similar sentences within the submission"
              />
              <FeatureCard
                icon={<Brain className="h-5 w-5 text-primary" />}
                title="AI Detection"
                description="Analyzes sentence patterns, vocabulary diversity, and writing style"
              />
              <FeatureCard
                icon={<FileSearch className="h-5 w-5 text-primary" />}
                title="Rewrite Detection"
                description="Identifies AI paraphrasing tools and unnatural synonym replacement"
              />
              <FeatureCard
                icon={<Lightbulb className="h-5 w-5 text-primary" />}
                title="Writing Feedback"
                description="Provides constructive suggestions to help students improve"
              />
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-border bg-card px-6 py-4">
        <p className="text-center text-xs text-muted-foreground">
          AuthentiWrite is a prototype tool using heuristic analysis. Results are
          indicative, not definitive.
        </p>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  )
}
