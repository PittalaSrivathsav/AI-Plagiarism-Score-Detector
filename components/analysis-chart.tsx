"use client"

import { useEffect, useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"

interface AnalysisChartProps {
  plagiarismScore: number
  aiScore: number
  authenticityScore: number
  rewriteScore: number
}

const COLORS = {
  plagiarism: "#ef4444", // Red
  ai: "#f97316", // Orange
  authenticity: "#22c55e", // Green
  rewrite: "#8b5cf6", // Purple
}

export function AnalysisChart({
  plagiarismScore,
  aiScore,
  authenticityScore,
  rewriteScore,
}: AnalysisChartProps) {
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const data = [
    {
      name: "Plagiarism",
      value: animated ? plagiarismScore : 0,
      color: COLORS.plagiarism,
      fullName: "Plagiarism Score",
    },
    {
      name: "AI Generated",
      value: animated ? aiScore : 0,
      color: COLORS.ai,
      fullName: "AI Generated Probability",
    },
    {
      name: "Authenticity",
      value: animated ? authenticityScore : 0,
      color: COLORS.authenticity,
      fullName: "Authenticity Score",
    },
    {
      name: "Rewriting",
      value: animated ? rewriteScore : 0,
      color: COLORS.rewrite,
      fullName: "AI Rewriting Risk",
    },
  ]

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { fullName: string; value: number; color: string } }> }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload
      return (
        <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
          <p className="text-sm font-medium text-foreground">{item.fullName}</p>
          <p className="text-lg font-bold" style={{ color: item.color }}>
            {item.value}%
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <BarChart3 className="h-4 w-4 text-primary" />
          </div>
          <CardTitle className="text-base">Authenticity Analysis Dashboard</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
                tickLine={false}
                axisLine={{ className: "stroke-border" }}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
                tickLine={false}
                axisLine={{ className: "stroke-border" }}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--secondary)", opacity: 0.5 }} />
              <Bar
                dataKey="value"
                radius={[6, 6, 0, 0]}
                animationDuration={1000}
                animationBegin={0}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap justify-center gap-4">
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-sm"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-muted-foreground">{item.fullName}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
