"use client"

import { Card } from "@/components/ui/card"
import { GitFork } from "lucide-react"
import type { StoredClaim } from "@/lib/api"

interface ProvenanceGraphProps {
  claim?: StoredClaim
}

export function ProvenanceGraph({ claim }: ProvenanceGraphProps) {
  const provenance = claim?.provenance
  const nodes = provenance?.nodes || []
  const edges = provenance?.edges || []

  const nodeMap = new Map(nodes.map((node) => [node.id, node]))
  const claimNode = nodeMap.get("claim")
  const evidenceEdges = edges.filter((edge) => edge.from === "claim")
  
  return (
    <Card className="p-10 min-h-96 flex flex-col items-center justify-center space-y-6 bg-muted/30 transition-all duration-300 hover:shadow-lg animate-fade-in relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 p-4 opacity-5">
        <GitFork className="h-40 w-40" />
      </div>

      <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center animate-pulse z-10">
        <GitFork className="h-10 w-10 text-primary" />
      </div>

      <div className="text-center space-y-3 z-10">
        <h4 className="font-semibold text-lg text-card-foreground">Provenance & Chain of Custody</h4>
        <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
          Tracing the origin and transformation steps for this specific claim.
        </p>
      </div>

      {nodes.length > 0 ? (
        <div className="w-full space-y-4 max-w-md z-10">
          {claimNode ? (
            <div className="flex items-center gap-4 relative">
              <div className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-primary/20 text-primary">
                <div className="h-2 w-2 rounded-full bg-current" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">claim</span>
                <span className="text-sm font-medium text-foreground line-clamp-2">{claimNode.text}</span>
              </div>
            </div>
          ) : null}

          {evidenceEdges.map((edge, i) => {
            const evidenceNode = nodeMap.get(edge.to)
            if (!evidenceNode) return null

            return (
              <div key={edge.to} className="flex items-center gap-4 relative">
                <div className="absolute left-[19px] -top-4 w-0.5 h-4 bg-border" />
                <div className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-chart-2/20 text-chart-2">
                  <div className="h-2 w-2 rounded-full bg-current" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">evidence</span>
                  <span className="text-sm font-medium text-foreground line-clamp-2">{evidenceNode.source || "Unknown source"}</span>
                  <span className="text-xs text-muted-foreground">
                    sim: {(edge.weight ?? 0).toFixed(3)}
                    {evidenceNode.score !== undefined ? ` | score: ${evidenceNode.score.toFixed(3)}` : ""}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <svg className="w-full h-64 opacity-20 mt-4 z-10" viewBox="0 0 400 300">
          <circle cx="200" cy="150" r="20" fill="currentColor" className="text-primary animate-pulse" />
          <circle cx="100" cy="80" r="15" fill="currentColor" className="text-accent" />
          <circle cx="300" cy="80" r="15" fill="currentColor" className="text-accent" />
          <circle cx="100" cy="220" r="15" fill="currentColor" className="text-accent" />
          <circle cx="300" cy="220" r="15" fill="currentColor" className="text-accent" />
          <line x1="200" y1="150" x2="100" y2="80" stroke="currentColor" strokeWidth="2" className="text-border" />
          <line x1="200" y1="150" x2="300" y2="80" stroke="currentColor" strokeWidth="2" className="text-border" />
          <line x1="200" y1="150" x2="100" y2="220" stroke="currentColor" strokeWidth="2" className="text-border" />
          <line x1="200" y1="150" x2="300" y2="220" stroke="currentColor" strokeWidth="2" className="text-border" />
        </svg>
      )}
    </Card>
  )
}
