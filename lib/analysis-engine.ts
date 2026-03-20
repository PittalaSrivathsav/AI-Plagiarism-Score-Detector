// ============================================================
// AuthentiWrite – Heuristic NLP Analysis Engine
// ============================================================

export interface SentenceFlag {
  sentence: string
  index: number
  type: "plagiarism" | "ai" | "rewrite"
  reason: string
  severity: "low" | "medium" | "high"
}

export interface DetectionReason {
  title: string
  description: string
  detected: boolean
}

export interface AnalysisResult {
  plagiarismScore: number
  aiScore: number
  rewriteScore: number
  authenticityScore: number
  flaggedSentences: SentenceFlag[]
  suggestions: string[]
  detectionReasons: DetectionReason[]
  stats: {
    totalSentences: number
    totalWords: number
    uniqueWords: number
    avgSentenceLength: number
    lexicalDiversity: number
    sentenceLengthVariance: number
  }
}

// ----------------------------------------------------------
// Utility helpers
// ----------------------------------------------------------

function splitIntoSentences(text: string): string[] {
  // Normalize line breaks and multiple spaces
  const normalizedText = text
    .replace(/\r\n/g, "\n")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
  
  // Split on sentence-ending punctuation followed by space or end of string
  const sentences = normalizedText
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 5)
  
  return sentences
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, "")
    .split(/\s+/)
    .filter(Boolean)
}

function cosineSimilarity(a: string, b: string): number {
  const tokensA = tokenize(a)
  const tokensB = tokenize(b)
  const allTokens = new Set([...tokensA, ...tokensB])
  const vecA: number[] = []
  const vecB: number[] = []
  allTokens.forEach((token) => {
    vecA.push(tokensA.filter((t) => t === token).length)
    vecB.push(tokensB.filter((t) => t === token).length)
  })
  const dot = vecA.reduce((sum, v, i) => sum + v * vecB[i], 0)
  const magA = Math.sqrt(vecA.reduce((sum, v) => sum + v * v, 0))
  const magB = Math.sqrt(vecB.reduce((sum, v) => sum + v * v, 0))
  if (magA === 0 || magB === 0) return 0
  return dot / (magA * magB)
}

function jaccardSimilarity(a: string, b: string): number {
  const setA = new Set(tokenize(a))
  const setB = new Set(tokenize(b))
  const intersection = new Set([...setA].filter((x) => setB.has(x)))
  const union = new Set([...setA, ...setB])
  if (union.size === 0) return 0
  return intersection.size / union.size
}

function variance(arr: number[]): number {
  if (arr.length === 0) return 0
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length
  return arr.reduce((sum, v) => sum + (v - mean) ** 2, 0) / arr.length
}

// ----------------------------------------------------------
// Over-formal / AI vocabulary markers
// ----------------------------------------------------------

const FORMAL_MARKERS = [
  "furthermore",
  "moreover",
  "consequently",
  "nevertheless",
  "henceforth",
  "notwithstanding",
  "in conclusion",
  "it is important to note",
  "it is worth noting",
  "it should be noted",
  "in this regard",
  "in light of",
  "with respect to",
  "pertaining to",
  "in the context of",
  "it is evident that",
  "one can observe",
  "it can be argued",
  "this demonstrates",
  "this illustrates",
  "as a result",
  "accordingly",
  "thus",
  "hence",
  "thereby",
  "subsequently",
  "additionally",
  "in summary",
  "to summarize",
  "overall",
  "in essence",
  "fundamentally",
  "significantly",
  "substantially",
  "comprehensively",
  "undoubtedly",
  "undeniably",
]

const PARAPHRASE_PATTERNS = [
  /\b(utilize|utilization)\b/gi,
  /\b(commence|commencement)\b/gi,
  /\b(facilitate|facilitation)\b/gi,
  /\b(implement|implementation)\b/gi,
  /\b(demonstrate|demonstration)\b/gi,
  /\b(approximately)\b/gi,
  /\b(subsequently)\b/gi,
  /\b(nevertheless)\b/gi,
  /\b(aforementioned)\b/gi,
  /\b(endeavor)\b/gi,
  /\b(ascertain)\b/gi,
  /\b(elucidate)\b/gi,
  /\b(leverage)\b/gi,
  /\b(optimize|optimization)\b/gi,
  /\b(in other words)\b/gi,
  /\b(to put it differently)\b/gi,
  /\b(that is to say)\b/gi,
  /\b(it is worth mentioning)\b/gi,
  /\b(it should be emphasized)\b/gi,
  /\b(in particular)\b/gi,
]

// ----------------------------------------------------------
// Main analysis function
// ----------------------------------------------------------

export function analyzeText(text: string): AnalysisResult {
  const sentences = splitIntoSentences(text)
  const allWords = tokenize(text)
  const uniqueWords = new Set(allWords)
  const sentenceLengths = sentences.map((s) => tokenize(s).length)
  const avgSentenceLength =
    sentenceLengths.length > 0
      ? sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length
      : 0
  const sentenceLengthVariance = variance(sentenceLengths)
  const lexicalDiversity =
    allWords.length > 0 ? uniqueWords.size / allWords.length : 1

  const flaggedSentences: SentenceFlag[] = []

  // ---- 1. Plagiarism detection (internal similarity) ------
  let plagiarismPairs = 0
  let totalPairs = 0

  for (let i = 0; i < sentences.length; i++) {
    for (let j = i + 1; j < sentences.length; j++) {
      totalPairs++
      const cos = cosineSimilarity(sentences[i], sentences[j])
      const jac = jaccardSimilarity(sentences[i], sentences[j])
      const combined = cos * 0.6 + jac * 0.4

      // Lowered threshold to 0.3 to catch more similar sentences
      if (combined > 0.3) {
        plagiarismPairs++
        if (
          !flaggedSentences.find(
            (f) => f.index === i && f.type === "plagiarism"
          )
        ) {
          flaggedSentences.push({
            sentence: sentences[i],
            index: i,
            type: "plagiarism",
            reason: `Similarity of ${Math.round(combined * 100)}% with another sentence in the text.`,
            severity: combined > 0.6 ? "high" : combined > 0.4 ? "medium" : "low",
          })
        }
        if (
          !flaggedSentences.find(
            (f) => f.index === j && f.type === "plagiarism"
          )
        ) {
          flaggedSentences.push({
            sentence: sentences[j],
            index: j,
            type: "plagiarism",
            reason: `Similarity of ${Math.round(combined * 100)}% with another sentence in the text.`,
            severity: combined > 0.6 ? "high" : combined > 0.4 ? "medium" : "low",
          })
        }
      }
    }
  }

  const plagiarismRatio =
    totalPairs > 0 ? plagiarismPairs / totalPairs : 0

  // ---- 2. AI-generated writing detection --------------------
  // 2a. Sentence length uniformity (low variance = suspicious)
  const normalizedVariance =
    avgSentenceLength > 0 ? sentenceLengthVariance / avgSentenceLength : 0
  const uniformityScore = Math.max(0, 1 - normalizedVariance / 5) // lower variance → higher score

  // 2b. Lexical diversity (low diversity = suspicious)
  const lexDivScore = Math.max(0, 1 - lexicalDiversity)

  // 2c. Formal marker density
  const lowerText = text.toLowerCase()
  let formalCount = 0
  FORMAL_MARKERS.forEach((marker) => {
    const regex = new RegExp(marker, "gi")
    const matches = lowerText.match(regex)
    if (matches) formalCount += matches.length
  })
  const formalDensity = allWords.length > 0 ? formalCount / allWords.length : 0
  const formalScore = Math.min(1, formalDensity * 20) // scale up

  // 2d. Repetitive sentence starters
  const starters = sentences.map((s) => {
    const words = tokenize(s)
    return words.slice(0, 3).join(" ")
  })
  const starterCounts: Record<string, number> = {}
  starters.forEach((s) => {
    starterCounts[s] = (starterCounts[s] || 0) + 1
  })
  const repeatedStarters = Object.values(starterCounts).filter(
    (c) => c > 1
  ).length
  const starterRepeatScore =
    starters.length > 0
      ? Math.min(1, (repeatedStarters / starters.length) * 3)
      : 0

  // Flag sentences with AI patterns - aggressive detection
  sentences.forEach((sentence, idx) => {
    const words = tokenize(sentence)
    const lowerSentence = sentence.toLowerCase()
    
    // Check for formal markers
    const formalMarkersFound = FORMAL_MARKERS.filter((m) =>
      lowerSentence.includes(m)
    )
    const hasFormality = formalMarkersFound.length > 0

    // Flag if has ANY formal marker (no word count restriction)
    if (hasFormality) {
      if (!flaggedSentences.find((f) => f.index === idx && f.type === "ai")) {
        flaggedSentences.push({
          sentence,
          index: idx,
          type: "ai",
          reason: `Contains formal language pattern: "${formalMarkersFound[0]}" - typical of AI-generated text.`,
          severity: formalMarkersFound.length > 1 ? "high" : "medium",
        })
      }
    }
    // Flag long sentences with common AI patterns
    else if (words.length >= 10 && /^(the|this|it|these|those|such|in|on|as|for|with|by|to|an?)\s/i.test(sentence)) {
      if (!flaggedSentences.find((f) => f.index === idx && f.type === "ai")) {
        flaggedSentences.push({
          sentence,
          index: idx,
          type: "ai",
          reason: "Long sentence with structured opening - may indicate AI-assisted writing.",
          severity: "low",
        })
      }
    }
  })

  // Combine AI score
  const aiScore = Math.min(
    100,
    Math.round(
      (uniformityScore * 30 +
        lexDivScore * 25 +
        formalScore * 25 +
        starterRepeatScore * 20) *
        100
    ) / 100
  )

  // ---- 3. AI Rewriter detection ----------------------------
  let paraphraseCount = 0
  PARAPHRASE_PATTERNS.forEach((pattern) => {
    const matches = text.match(pattern)
    if (matches) paraphraseCount += matches.length
  })
  const paraphraseDensity =
    allWords.length > 0 ? paraphraseCount / allWords.length : 0

  // Check structure similarity across paragraphs
  const paragraphs = text
    .split(/\n\n+/)
    .filter((p) => p.trim().length > 20)
  let structuralSim = 0
  if (paragraphs.length > 1) {
    let simCount = 0
    let simTotal = 0
    for (let i = 0; i < paragraphs.length; i++) {
      for (let j = i + 1; j < paragraphs.length; j++) {
        simTotal++
        const pSentsA = splitIntoSentences(paragraphs[i])
        const pSentsB = splitIntoSentences(paragraphs[j])
        if (pSentsA.length > 0 && pSentsB.length > 0) {
          const avgLenA =
            pSentsA.reduce((a, s) => a + tokenize(s).length, 0) /
            pSentsA.length
          const avgLenB =
            pSentsB.reduce((a, s) => a + tokenize(s).length, 0) /
            pSentsB.length
          if (Math.abs(avgLenA - avgLenB) < 3) simCount++
        }
      }
    }
    structuralSim = simTotal > 0 ? simCount / simTotal : 0
  }

  // Flag paraphrasing sentences - lowered threshold
  sentences.forEach((sentence, idx) => {
    let matchCount = 0
    const matchedPatterns: string[] = []
    PARAPHRASE_PATTERNS.forEach((pattern) => {
      const match = sentence.match(pattern)
      if (match) {
        matchCount++
        matchedPatterns.push(match[0])
      }
      pattern.lastIndex = 0
    })
    
    // Lowered from 2 to 1 match
    if (matchCount >= 1) {
      if (
        !flaggedSentences.find(
          (f) => f.index === idx && f.type === "rewrite"
        )
      ) {
        flaggedSentences.push({
          sentence,
          index: idx,
          type: "rewrite",
          reason: `Contains academic/formal substitution "${matchedPatterns[0]}" - common in AI paraphrasing tools.`,
          severity: matchCount >= 3 ? "high" : matchCount >= 2 ? "medium" : "low",
        })
      }
    }
  })

  // More aggressive rewrite scoring
  const rewriteFlagCount = flaggedSentences.filter(f => f.type === "rewrite").length
  const rewriteFlagRatio = sentences.length > 0 ? rewriteFlagCount / sentences.length : 0
  
  const rewriteScore = Math.min(
    100,
    Math.round(
      (Math.min(1, paraphraseDensity * 50) * 30 +
        structuralSim * 20 +
        formalScore * 20 +
        rewriteFlagRatio * 30) *
        100
    ) / 100
  )

  // ---- 4. Writing improvement suggestions ------------------
  const suggestions: string[] = []

  if (lexicalDiversity < 0.5) {
    suggestions.push(
      "Your vocabulary diversity is low. Try using a wider range of words to make your writing more engaging."
    )
  }
  if (sentenceLengthVariance < 4) {
    suggestions.push(
      "Your sentences are very similar in length. Vary your sentence structure — mix short punchy sentences with longer descriptive ones."
    )
  }
  if (formalCount > 3) {
    suggestions.push(
      "Your writing uses many formal transition phrases. Try adding personal voice and less formulaic connectors."
    )
  }
  if (
    sentences.length > 5 &&
    repeatedStarters / sentences.length > 0.3
  ) {
    suggestions.push(
      "Several sentences start the same way. Vary your sentence openings to create more natural flow."
    )
  }
  if (avgSentenceLength > 25) {
    suggestions.push(
      "Your average sentence is quite long. Break some complex sentences into shorter ones for readability."
    )
  }
  if (avgSentenceLength < 8) {
    suggestions.push(
      "Your sentences are very short. Try combining related ideas into more developed sentences."
    )
  }

  // Always add positive suggestions
  suggestions.push(
    "Try adding personal examples or opinions to strengthen authenticity."
  )
  if (sentences.length < 5) {
    suggestions.push(
      "Consider expanding your text with more supporting details and examples."
    )
  }

  // Calculate plagiarism score based on flagged sentences
  const plagFlagCount = flaggedSentences.filter(f => f.type === "plagiarism").length
  const plagFlagRatio = sentences.length > 0 ? plagFlagCount / sentences.length : 0
  const calculatedPlagiarismScore = Math.max(
    Math.round(plagiarismRatio * 200),
    Math.round(plagFlagRatio * 100)
  )

  const finalPlagiarismScore = Math.min(100, calculatedPlagiarismScore)
  const finalAiScore = Math.round(aiScore)
  const finalRewriteScore = Math.round(rewriteScore)

  // Calculate authenticity score (inverse of risk scores)
  const authenticityScore = Math.max(
    0,
    Math.round(100 - (finalPlagiarismScore * 0.4 + finalAiScore * 0.35 + finalRewriteScore * 0.25))
  )

  // Build detection reasons
  const detectionReasons: DetectionReason[] = [
    {
      title: "Repetitive Sentence Length",
      description: "Many sentences have almost the same length, which is common in AI-generated writing.",
      detected: sentenceLengthVariance < 5
    },
    {
      title: "Low Vocabulary Diversity",
      description: "The same words appear repeatedly instead of varied vocabulary.",
      detected: lexicalDiversity < 0.5
    },
    {
      title: "Identical Sentence Structure",
      description: "Multiple sentences follow the same grammatical pattern.",
      detected: repeatedStarters > 2
    },
    {
      title: "Overly Formal Tone",
      description: "The writing uses excessively formal or academic language patterns.",
      detected: formalCount > 2
    },
    {
      title: "Synonym Replacement Patterns",
      description: "Detected words commonly used by AI paraphrasing tools.",
      detected: paraphraseCount > 1
    },
    {
      title: "Common AI Transition Phrases",
      description: "Phrases like \"Furthermore\", \"In conclusion\", or \"Moreover\" are frequently used by AI.",
      detected: formalCount > 0
    },
    {
      title: "Similar Sentences Detected",
      description: "Found sentences that are highly similar to each other within the text.",
      detected: plagiarismPairs > 0
    },
    {
      title: "Uniform Paragraph Structure",
      description: "Paragraphs have similar average sentence lengths, suggesting templated writing.",
      detected: structuralSim > 0.5
    }
  ]

  return {
    plagiarismScore: finalPlagiarismScore,
    aiScore: finalAiScore,
    rewriteScore: finalRewriteScore,
    authenticityScore,
    flaggedSentences,
    suggestions,
    detectionReasons,
    stats: {
      totalSentences: sentences.length,
      totalWords: allWords.length,
      uniqueWords: uniqueWords.size,
      avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
      lexicalDiversity: Math.round(lexicalDiversity * 100) / 100,
      sentenceLengthVariance:
        Math.round(sentenceLengthVariance * 10) / 10,
    },
  }
}
