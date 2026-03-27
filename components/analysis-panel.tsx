"use client"

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { VerdictCard } from "./verdict-card"
import { ProvenanceGraph } from "./provenance-graph"
import { ExplainabilityTabs } from "./explainability-tabs"
import { MediaViewer } from "./media-viewer"
import { ExternalLink, FileText, GitFork, ImageIcon, Lightbulb, Search } from "lucide-react"
import type { EvidenceResult, StoredClaim } from "@/lib/api"

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
  const hasMedia = false
  const evidence = getNormalizedEvidence(claim)

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
      {/* Claim Header */}
      <div className="space-y-4 animate-fade-in-up">
        <Badge variant="outline" className="transition-all duration-300 hover:scale-105">
          Claim #{claimIndex + 1}
        </Badge>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary">ID: {claim.id}</Badge>
          <Badge variant="secondary">Text ID: {claim.sourceTextId}</Badge>
          {claim.claim_type ? <Badge variant="outline">Type: {claim.claim_type}</Badge> : null}
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

      {/* Evidence Section */}
      <section className="space-y-6 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Evidence Sources
          </h3>
          <Badge variant="secondary" className="font-normal">
            {evidence.length} found
          </Badge>
        </div>

        {evidence.length === 0 ? (
          <Card className="p-8 text-center space-y-4 border-dashed bg-muted/30">
            <Search className="h-10 w-10 mx-auto text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              No supporting or refuting evidence was found in the knowledge base.
            </p>
          </Card>
        ) : (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {evidence.map((item, idx) => (
              <Card key={idx} className="p-4 space-y-3 transition-all duration-300 hover:shadow-md border-border/50">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex gap-2">
                    <Badge
                      variant={
                        item.verdict?.toLowerCase() === "supports"
                          ? "default"
                          : item.verdict?.toLowerCase() === "refutes"
                            ? "destructive"
                            : "secondary"
                      }
                      className="text-[10px] uppercase font-bold px-1.5 py-0"
                    >
                      {item.verdict || "NEUTRAL"}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] font-normal px-1.5 py-0 border-primary/30">
                      Score: {item.score.toFixed(3)}
                    </Badge>
                    {typeof item.quality_score === "number" ? (
                      <Badge variant="outline" className="text-[10px] font-normal px-1.5 py-0 border-chart-4/40 text-chart-4">
                        Quality: {item.quality_score.toFixed(3)}
                      </Badge>
                    ) : null}
                  </div>
                </div>
                <p className="text-sm text-card-foreground leading-relaxed italic">&quot;{item.text}&quot;</p>
                {item.highlight_text ? (
                  <div className="text-xs text-chart-4 font-medium bg-chart-4/10 rounded px-2 py-1 inline-block">
                    Highlight: {item.highlight_text}
                  </div>
                ) : null}
                {item.matched_terms && item.matched_terms.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {item.matched_terms.slice(0, 8).map((term) => (
                      <Badge key={term} variant="outline" className="text-[10px] px-1.5 py-0">
                        {term}
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <ExternalLink className="h-3 w-3" /> Source: {item.source || "Internal Wiki"}
                  </span>
                  <span className="text-[11px] font-medium text-primary">
                    {typeof item.confidence === "number" ? `${(item.confidence * 100).toFixed(0)}% Match` : ""}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Provenance Section */}
      <section className="space-y-4 animate-fade-in-up" style={{ animationDelay: "0.35s" }}>
        <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
          <GitFork className="h-5 w-5" />
          Provenance Graph
        </h3>
        <ProvenanceGraph claim={claim} />
      </section>

      {/* Explainability Section */}
      <section className="space-y-4 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
        <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Explainability
        </h3>
        <ExplainabilityTabs claim={claim} />
      </section>

      {/* Media Section */}
      <section className="space-y-4 animate-fade-in-up" style={{ animationDelay: "0.45s" }}>
        <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Media
        </h3>
        {!hasMedia ? (
          <Card className="p-10 text-center space-y-4 animate-fade-in">
            <ImageIcon className="h-14 w-14 mx-auto text-muted-foreground/50" />
            <h4 className="font-semibold text-foreground">No Media Content</h4>
            <p className="text-sm text-muted-foreground">
              This claim does not contain any image, video, or audio content to display.
            </p>
          </Card>
        ) : (
          <MediaViewer hasVideo={false} hasAudio={false} />
        )}
      </section>
    </div>
  )
}

function getNormalizedEvidence(claim: StoredClaim): EvidenceResult[] {
  if (Array.isArray(claim.evidence) && claim.evidence.length > 0) {
    return claim.evidence
      .map((item) => ({
        text: getBestText(item),
        score: typeof item.score === "number" ? item.score : 0,
        source: item.source,
        matched_terms: Array.isArray(item.matched_terms) ? item.matched_terms : [],
        verdict: item.verdict,
        confidence: typeof item.confidence === "number" ? item.confidence : null,
        quality_score: typeof item.quality_score === "number" ? item.quality_score : null,
        highlight_text: typeof item.highlight_text === "string" ? item.highlight_text : null,
      }))
      .filter((item) => item.text.length > 0)
  }

  const nodes = claim.provenance?.nodes
  if (!Array.isArray(nodes) || nodes.length === 0) {
    return []
  }

  return nodes
    .filter((node) => node.type === "evidence")
    .map((node) => ({
      text: getBestText(node),
      score: typeof node.score === "number" ? node.score : 0,
      source: node.source || "Unknown",
      matched_terms: [],
      verdict: null,
      confidence: null,
      quality_score: null,
      highlight_text: null,
    }))
    .filter((item) => item.text.length > 0)
}

function getBestText(value: unknown): string {
  if (!value || typeof value !== "object") {
    return ""
  }

  const record = value as Record<string, unknown>
  const candidates = [record.text, record.snippet, record.content, record.sentence, record.body, record.title]

  for (const candidate of candidates) {
    if (typeof candidate === "string") {
      const trimmed = candidate.trim()
      if (trimmed.length > 0) {
        return trimmed
      }
    }
  }

  return ""
}
