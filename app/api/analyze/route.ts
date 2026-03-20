import { NextRequest, NextResponse } from "next/server"
import { analyzeText } from "@/lib/analysis-engine"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { text } = body

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Please provide text to analyze." },
        { status: 400 }
      )
    }

    if (text.trim().length < 50) {
      return NextResponse.json(
        { error: "Please provide at least 50 characters of text for meaningful analysis." },
        { status: 400 }
      )
    }

    const result = analyzeText(text)

    return NextResponse.json(result)
  } catch {
    return NextResponse.json(
      { error: "An error occurred during analysis." },
      { status: 500 }
    )
  }
}
