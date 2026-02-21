"use client"

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { VerdictCard } from "./verdict-card"
import type { StoredClaim } from "@/lib/api"

interface AnalysisPanelProps {
  claim?: StoredClaim
  claimIndex: number
}

export function AnalysisPanel({ claim, claimIndex }: AnalysisPanelProps) {
  if (!claim) {
    return (
      <div className="p-8 space-y-8 max-w-4xl mx-auto">
        <Card className="p-8 text-center text-muted-foreground">No claims available. Submit text from Upload page.</Card>
      </div>
    )
  }

  const confidence = Math.max(0, Math.min(100, claim.confidence * 100))

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      {/* Claim Header */}
      <div className="space-y-4 animate-fade-in-up">
        <Badge variant="outline" className="transition-all duration-300 hover:scale-105">
          Claim #{claimIndex + 1}
        </Badge>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary">ID: {claim.id}</Badge>
          <Badge variant="secondary">Text ID: {claim.sourceTextId}</Badge>
        </div>
        <h2 className="text-3xl font-bold text-foreground text-balance">{claim.text}</h2>
      </div>

      {/* Verdict Card */}
      <div className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
        <VerdictCard verdict={claim.verdict ?? "unverified"} confidence={confidence} />
      </div>

      {/* Confidence Score */}
      <Card
        className="p-6 space-y-4 transition-all duration-300 hover:shadow-lg animate-fade-in-up"
        style={{ animationDelay: "0.2s" }}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-card-foreground">Confidence Score</h3>
          <span className="text-2xl font-bold text-primary">{confidence.toFixed(1)}%</span>
        </div>
        <Progress value={confidence} className="h-3 transition-all duration-500" />
        <p className="text-sm text-muted-foreground">Confidence from claim extraction model inference.</p>
      </Card>
    </div>
  )
}
