"use client"

import { ThemeToggle } from "@/components/theme-toggle"
import { Shield, FileText, Brain, Sparkles } from "lucide-react"

export function Header() {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">

        {/* Logo + Title */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-foreground">
              AuthentiWrite
            </h1>
            <p className="text-xs text-muted-foreground">
              AI & Plagiarism Detection
            </p>
          </div>
        </div>

        {/* Navigation + Theme Toggle */}
        <div className="flex items-center gap-6">

          <nav className="hidden items-center gap-6 md:flex">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>Submit</span>
            </div>

            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Brain className="h-4 w-4" />
              <span>Analyze</span>
            </div>

            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              <span>Improve</span>
            </div>
          </nav>

          {/* Theme Switch Button */}
          <ThemeToggle />

        </div>

      </div>
    </header>
  )
}