"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink } from "lucide-react"

interface EvidenceCardProps {
  source: string
  snippet: string
  score: number
}

export function EvidenceCard({ source, snippet, score }: EvidenceCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 0.85) return "text-chart-4 bg-chart-4/10 border-chart-4/50"
    if (score >= 0.7) return "text-chart-5 bg-chart-5/10 border-chart-5/50"
    return "text-muted-foreground bg-muted/10 border-muted/50"
  }

  return (
    <Card className="p-8 space-y-5 transition-all duration-300 hover:shadow-lg hover:scale-[1.01]">
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <h4 className="font-semibold text-card-foreground">{source}</h4>
            <ExternalLink className="h-4 w-4 text-muted-foreground transition-all duration-300 hover:text-primary hover:scale-125 cursor-pointer" />
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{snippet}</p>
        </div>
        <Badge className={`${getScoreColor(score)} border px-3 py-1 transition-all duration-300 hover:scale-110`}>
          {(score * 100).toFixed(0)}%
        </Badge>
      </div>
    </Card>
  )
}
