"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProvenanceGraph } from "./provenance-graph"
import { ExplainabilityTabs } from "./explainability-tabs"
import { MediaViewer } from "./media-viewer"
import { FileText, GitFork, Lightbulb, ImageIcon, ExternalLink, Search } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { StoredClaim } from "@/lib/api"

interface RightPanelProps {
  claimIndex: number
  claim?: StoredClaim
}

export function RightPanel({ claimIndex, claim }: RightPanelProps) {
  const evidence = claim?.evidence || []
  const hasMedia = false // Placeholder for future media support

  return (
    <div className="p-8">
      <Tabs defaultValue="evidence" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="evidence" className="gap-2 transition-all duration-300">
            <FileText className="h-4 w-4" />
            <span className="hidden lg:inline">Evidence</span>
          </TabsTrigger>
          <TabsTrigger value="provenance" className="gap-2 transition-all duration-300">
            <GitFork className="h-4 w-4" />
            <span className="hidden lg:inline">Graph</span>
          </TabsTrigger>
          <TabsTrigger value="explainability" className="gap-2 transition-all duration-300">
            <Lightbulb className="h-4 w-4" />
            <span className="hidden lg:inline">AI</span>
          </TabsTrigger>
          <TabsTrigger value="media" className="gap-2 transition-all duration-300">
            <ImageIcon className="h-4 w-4" />
            <span className="hidden lg:inline">Media</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="evidence" className="space-y-6 mt-2 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg text-foreground">Evidence Sources</h3>
            <Badge variant="secondary" className="font-normal">
              {evidence.length} found
            </Badge>
          </div>
          
          {evidence.length === 0 ? (
            <Card className="p-8 text-center space-y-4 border-dashed bg-muted/30">
              <Search className="h-10 w-10 mx-auto text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No supporting or refuting evidence was found in the knowledge base.</p>
            </Card>
          ) : (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {evidence.map((item, idx) => (
                <Card key={idx} className="p-4 space-y-3 transition-all duration-300 hover:shadow-md border-border/50">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex gap-2">
                      <Badge variant={item.verdict?.toLowerCase() === 'supports' ? 'default' : item.verdict?.toLowerCase() === 'refutes' ? 'destructive' : 'secondary'} className="text-[10px] uppercase font-bold px-1.5 py-0">
                        {item.verdict || 'NEUTRAL'}
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
                  <p className="text-sm text-card-foreground leading-relaxed italic">"{item.text}"</p>
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
                      {item.confidence ? `${(item.confidence * 100).toFixed(0)}% Match` : ''}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="provenance" className="mt-2 animate-fade-in">
          <ProvenanceGraph claim={claim} />
        </TabsContent>

        <TabsContent value="explainability" className="mt-2 animate-fade-in">
          <ExplainabilityTabs claim={claim} />
        </TabsContent>

        <TabsContent value="media" className="mt-2 animate-fade-in">
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
