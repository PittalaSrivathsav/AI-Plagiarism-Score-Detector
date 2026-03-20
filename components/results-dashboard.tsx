"use client"

import type { AnalysisResult, SentenceFlag } from "@/lib/analysis-engine"
import { ScoreMeter } from "@/components/score-meter"
import { HighlightedText } from "@/components/highlighted-text"
import { FlaggedSentences } from "@/components/flagged-sentences"
import { WritingSuggestions } from "@/components/writing-suggestions"
import { AnalysisChart } from "@/components/analysis-chart"
import { DetectionReasons } from "@/components/detection-reasons"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Shield,
  Copy,
  Bot,
  AlertTriangle,
  ArrowLeft,
  Download,
  CheckCircle2,
  FileText,
} from "lucide-react"

function generateReportText(result: AnalysisResult, text: string): string {
  const date = new Date().toLocaleString()

  const getTypeLabel = (type: SentenceFlag["type"]) => {
    switch (type) {
      case "plagiarism": return "Plagiarism"
      case "ai": return "AI Pattern"
      case "rewrite": return "AI Rewrite"
    }
  }

  let report = `
═══════════════════════════════════════════════════════════════
                    AUTHENTIWRITE ANALYSIS REPORT
═══════════════════════════════════════════════════════════════

Generated: ${date}

───────────────────────────────────────────────────────────────
                         SCORE SUMMARY
───────────────────────────────────────────────────────────────

  Authenticity Score:        ${result.authenticityScore}%
  Plagiarism Score:          ${result.plagiarismScore}%
  AI Generated Probability:  ${result.aiScore}%
  AI Rewriting Risk:         ${result.rewriteScore}%

───────────────────────────────────────────────────────────────
                       TEXT STATISTICS
───────────────────────────────────────────────────────────────

  Total Sentences:           ${result.stats.totalSentences}
  Total Words:               ${result.stats.totalWords}
  Unique Words:              ${result.stats.uniqueWords}
  Avg. Sentence Length:      ${result.stats.avgSentenceLength} words
  Lexical Diversity:         ${(result.stats.lexicalDiversity * 100).toFixed(1)}%
  Sentence Length Variance:  ${result.stats.sentenceLengthVariance}

───────────────────────────────────────────────────────────────
                  WHY THIS TEXT WAS FLAGGED
───────────────────────────────────────────────────────────────
`

  const detectedReasons = result.detectionReasons.filter(r => r.detected)
  if (detectedReasons.length === 0) {
    report += `
  No major concerns detected.
`
  } else {
    detectedReasons.forEach((reason) => {
      report += `
  * ${reason.title}
    ${reason.description}
`
    })
  }

  report += `
───────────────────────────────────────────────────────────────
                     FLAGGED SECTIONS (${result.flaggedSentences.length})
───────────────────────────────────────────────────────────────
`

  if (result.flaggedSentences.length === 0) {
    report += `
  No suspicious sections were detected in this submission.
`
  } else {
    result.flaggedSentences.forEach((flag, idx) => {
      report += `
  [${idx + 1}] ${getTypeLabel(flag.type).toUpperCase()} - ${flag.severity.toUpperCase()} SEVERITY
  
      "${flag.sentence}"
      
      Reason: ${flag.reason}
`
    })
  }

  report += `
───────────────────────────────────────────────────────────────
                   WRITING IMPROVEMENT TIPS
───────────────────────────────────────────────────────────────
`

  result.suggestions.forEach((suggestion, idx) => {
    report += `
  ${idx + 1}. ${suggestion}
`
  })

  report += `
───────────────────────────────────────────────────────────────
                      ANALYZED TEXT
───────────────────────────────────────────────────────────────

${text}

═══════════════════════════════════════════════════════════════
              END OF AUTHENTIWRITE ANALYSIS REPORT
═══════════════════════════════════════════════════════════════

DISCLAIMER: AuthentiWrite uses heuristic analysis algorithms. 
Results are indicative and should not be used as the sole basis 
for academic decisions. Human review is recommended.
`

  return report
}

function downloadReport(result: AnalysisResult, text: string) {
  const reportContent = generateReportText(result, text)
  const blob = new Blob([reportContent], { type: "text/plain;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `authentiwrite-report-${Date.now()}.txt`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

interface ResultsDashboardProps {
  result: AnalysisResult
  text: string
  onReset: () => void
}

export function ResultsDashboard({ result, text, onReset }: ResultsDashboardProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI Writing Authenticity Report</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Comprehensive analysis of the submitted text
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onReset} className="gap-1.5">
            <ArrowLeft className="h-3.5 w-3.5" />
            New Analysis
          </Button>
          <Button
            size="sm"
            onClick={() => downloadReport(result, text)}
            className="gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            Download Report
          </Button>
        </div>
      </div>

      {/* Score Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ScoreMeter
          label="Plagiarism Score"
          score={result.plagiarismScore}
          description="Internal similarity"
          icon={<Copy className="h-4 w-4 text-red-600 dark:text-red-400" />}
        />
        <ScoreMeter
          label="AI Generated"
          score={result.aiScore}
          description="Pattern analysis"
          icon={<Bot className="h-4 w-4 text-orange-600 dark:text-orange-400" />}
        />
        <ScoreMeter
          label="Authenticity Score"
          score={result.authenticityScore}
          description="Overall authenticity"
          icon={<CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />}
          variant="success"
        />
        <ScoreMeter
          label="AI Rewriting Risk"
          score={result.rewriteScore}
          description="Paraphrasing detection"
          icon={<AlertTriangle className="h-4 w-4 text-purple-600 dark:text-purple-400" />}
        />
      </div>

      {/* Interactive Chart */}
      <AnalysisChart
        plagiarismScore={result.plagiarismScore}
        aiScore={result.aiScore}
        authenticityScore={result.authenticityScore}
        rewriteScore={result.rewriteScore}
      />

      {/* Suspicious Sections */}
      <FlaggedSentences flaggedSentences={result.flaggedSentences} />

      {/* Explainable AI Reasons */}
      <DetectionReasons reasons={result.detectionReasons} />

      {/* Highlighted Text */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Highlighted Text Analysis</CardTitle>
              <CardDescription>
                Suspicious sections are color-coded in the original text
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <HighlightedText text={text} flaggedSentences={result.flaggedSentences} />
        </CardContent>
      </Card>

      {/* Writing Improvement Suggestions */}
      <WritingSuggestions
        suggestions={result.suggestions}
        stats={result.stats}
      />
    </div>
  )
}
