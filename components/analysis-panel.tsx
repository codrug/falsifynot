"use client"

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { VerdictCard } from "./verdict-card"
import { ProvenanceGraph } from "./provenance-graph"
import { ExplainabilityTabs } from "./explainability-tabs"
import { MediaViewer } from "./media-viewer"
import {
  ExternalLink, FileText, GitFork, ImageIcon, Lightbulb, Search,
  Eye, Layers, Globe, Video, ArrowRight, Sparkles
} from "lucide-react"
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
  const mediaImageUrl = claim.sourceInputKind === "image" ? (claim.sourcePreviewUrl ?? null) : null
  const hasMedia = !!claim.visual_context?.ocr_text || !!mediaImageUrl
  const evidence = getNormalizedEvidence(claim)
  const vc = claim.visual_context
  const mc = claim.multimodal_contribution
  const ext = claim.external_evidence

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

      {/* Visual Context Section (Multimodal) */}
      {vc && (vc.ocr_text || vc.image_text_similarity > 0) && (
        <section className="space-y-4 animate-fade-in-up" style={{ animationDelay: "0.25s" }}>
          <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
            <Eye className="h-5 w-5 text-chart-2" />
            Visual Context
          </h3>
          <Card className="p-6 space-y-4 border-chart-2/30 bg-gradient-to-br from-chart-2/5 to-transparent">
            {vc.ocr_text && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs border-chart-2/40 text-chart-2">
                    <ImageIcon className="h-3 w-3 mr-1" />
                    Image Text Extracted
                  </Badge>
                  <Badge variant={vc.used_in_verification ? "default" : "secondary"} className="text-xs">
                    {vc.used_in_verification ? "Used in verification" : "Not used"}
                  </Badge>
                </div>
                <Card className="p-4 bg-muted/30 border-dashed">
                  <p className="text-sm text-card-foreground italic leading-relaxed">&quot;{vc.ocr_text}&quot;</p>
                </Card>
              </div>
            )}
            {vc.image_text_similarity > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-card-foreground flex items-center gap-1">
                    <Sparkles className="h-4 w-4 text-chart-2" />
                    Image-Text Semantic Similarity (CLIP)
                  </span>
                  <span className="text-lg font-bold text-chart-2">{(vc.image_text_similarity * 100).toFixed(1)}%</span>
                </div>
                <Progress value={vc.image_text_similarity * 100} className="h-2" />
              </div>
            )}
          </Card>
        </section>
      )}

      {/* Multimodal Contribution Section */}
      {mc && mc.image_impact !== "none" && (
        <section className="space-y-4 animate-fade-in-up" style={{ animationDelay: "0.28s" }}>
          <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
            <Layers className="h-5 w-5 text-chart-4" />
            Multimodal Contribution
          </h3>
          <Card className="p-6 border-chart-4/30 bg-gradient-to-br from-chart-4/5 to-transparent">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="text-center space-y-2 p-4 rounded-lg bg-muted/30">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Text-only Verdict</p>
                <Badge
                  variant={mc.text_only_verdict === "SUPPORTS" ? "default" : mc.text_only_verdict === "REFUTES" ? "destructive" : "secondary"}
                  className="text-sm px-3 py-1"
                >
                  {mc.text_only_verdict}
                </Badge>
              </div>
              <div className="flex justify-center">
                <ArrowRight className="h-6 w-6 text-chart-4" />
              </div>
              <div className="text-center space-y-2 p-4 rounded-lg bg-chart-4/10 border border-chart-4/20">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">With Image Context</p>
                <Badge
                  variant={mc.with_image_verdict === "SUPPORTS" ? "default" : mc.with_image_verdict === "REFUTES" ? "destructive" : "secondary"}
                  className="text-sm px-3 py-1"
                >
                  {mc.with_image_verdict}
                </Badge>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              Image impact: <span className="font-medium text-chart-4">{mc.image_impact}</span>
            </p>
          </Card>
        </section>
      )}

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

      {/* Explainability Section */}
      <section className="space-y-4 animate-fade-in-up" style={{ animationDelay: "0.32s" }}>
        <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Explainability
        </h3>
        <ExplainabilityTabs claim={claim} />
      </section>

      {/* External Evidence Section */}
      {ext && (ext.web_sources.length > 0 || ext.video_sources.length > 0) && (
        <section className="space-y-4 animate-fade-in-up" style={{ animationDelay: "0.35s" }}>
          <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
            <Globe className="h-5 w-5 text-chart-5" />
            External Evidence
          </h3>
          <Card className="p-6 space-y-4 border-chart-5/30">
            {ext.web_sources.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                  <Globe className="h-3.5 w-3.5" />
                  Web Sources
                </h4>
                <div className="space-y-2">
                  {ext.web_sources.map((ws, idx) => (
                    <a
                      key={idx}
                      href={ws.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all duration-300 hover:shadow-sm group"
                    >
                      <ExternalLink className="h-4 w-4 text-chart-5 group-hover:scale-110 transition-transform" />
                      <span className="text-sm text-card-foreground group-hover:text-primary transition-colors">{ws.title}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
            {ext.video_sources.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                  <Video className="h-3.5 w-3.5" />
                  Video Sources
                </h4>
                <div className="space-y-2">
                  {ext.video_sources.map((vs, idx) => (
                    <a
                      key={idx}
                      href={vs.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all duration-300 hover:shadow-sm group"
                    >
                      <Video className="h-4 w-4 text-chart-3 group-hover:scale-110 transition-transform" />
                      <span className="text-sm text-card-foreground group-hover:text-primary transition-colors">{vs.title}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </section>
      )}

      {/* Provenance Section */}
      <section className="space-y-4 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
        <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
          <GitFork className="h-5 w-5" />
          Provenance Graph
        </h3>
        <ProvenanceGraph claim={claim} />
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
          <MediaViewer hasVideo={false} hasAudio={false} imageUrl={mediaImageUrl} />
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
