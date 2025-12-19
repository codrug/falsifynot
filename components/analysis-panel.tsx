"use client"

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { VerdictCard } from "./verdict-card"
import { EvidenceCard } from "./evidence-card"
import { CheckCircle2, XCircle, AlertCircle, HelpCircle } from "lucide-react"

const mockAnalysis = [
  {
    claim: "Climate change is causing increased hurricane activity in the Atlantic Ocean",
    verdict: "supported",
    confidence: 87,
    evidence: [
      {
        source: "Nature Climate Change",
        snippet: "Recent studies show a 15% increase in Category 4-5 hurricanes...",
        score: 0.92,
      },
      {
        source: "NOAA Research",
        snippet: "Warmer ocean temperatures contribute to more intense tropical storms...",
        score: 0.88,
      },
      {
        source: "IPCC Report 2023",
        snippet: "Climate models predict continued increase in hurricane intensity...",
        score: 0.85,
      },
    ],
  },
  {
    claim: "Eating carrots improves night vision significantly",
    verdict: "refuted",
    confidence: 78,
    evidence: [
      {
        source: "Scientific American",
        snippet: "The carrot-vision myth originated from WWII propaganda...",
        score: 0.91,
      },
      {
        source: "Journal of Nutrition",
        snippet: "Vitamin A deficiency affects vision, but carrots dont enhance normal vision...",
        score: 0.82,
      },
      {
        source: "Medical News Today",
        snippet: "Carrots contain beta-carotene but wont give you superhuman night vision...",
        score: 0.79,
      },
    ],
  },
]

interface AnalysisPanelProps {
  claimIndex: number
}

export function AnalysisPanel({ claimIndex }: AnalysisPanelProps) {
  const analysis = mockAnalysis[claimIndex % mockAnalysis.length]

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case "supported":
        return CheckCircle2
      case "refuted":
        return XCircle
      case "mixed":
        return AlertCircle
      default:
        return HelpCircle
    }
  }

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      {/* Claim Header */}
      <div className="space-y-4 animate-fade-in-up">
        <Badge variant="outline" className="transition-all duration-300 hover:scale-105">
          Claim #{claimIndex + 1}
        </Badge>
        <h2 className="text-3xl font-bold text-foreground text-balance">{analysis.claim}</h2>
      </div>

      {/* Verdict Card */}
      <div className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
        <VerdictCard verdict={analysis.verdict} confidence={analysis.confidence} />
      </div>

      {/* Confidence Score */}
      <Card
        className="p-6 space-y-4 transition-all duration-300 hover:shadow-lg animate-fade-in-up"
        style={{ animationDelay: "0.2s" }}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-card-foreground">Confidence Score</h3>
          <span className="text-2xl font-bold text-primary">{analysis.confidence}%</span>
        </div>
        <Progress value={analysis.confidence} className="h-3 transition-all duration-500" />
        <p className="text-sm text-muted-foreground">
          Based on {analysis.evidence.length} verified sources and cross-reference analysis
        </p>
      </Card>

      {/* Evidence Cards */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          Supporting Evidence
        </h3>
        {analysis.evidence.map((evidence, index) => (
          <div key={index} className="animate-fade-in-up" style={{ animationDelay: `${0.4 + index * 0.1}s` }}>
            <EvidenceCard {...evidence} />
          </div>
        ))}
      </div>
    </div>
  )
}
