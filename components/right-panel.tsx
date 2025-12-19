"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EvidenceCard } from "./evidence-card"
import { ProvenanceGraphPlaceholder } from "./provenance-graph"
import { ExplainabilityTabs } from "./explainability-tabs"
import { MediaViewer } from "./media-viewer"
import { FileText, GitFork, Lightbulb, ImageIcon } from "lucide-react"
import { Card } from "@/components/ui/card"

interface RightPanelProps {
  claimIndex: number
  claimData?: {
    hasMedia: boolean
    hasVideo: boolean
    hasAudio: boolean
    hasOCR: boolean
  }
}

export function RightPanel({ claimIndex, claimData }: RightPanelProps) {
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
          <h3 className="font-semibold text-lg text-foreground mb-4">Evidence Sources</h3>
          <EvidenceCard
            source="Nature Climate Change"
            snippet="Recent peer-reviewed studies demonstrate significant trends..."
            score={0.92}
          />
          <EvidenceCard
            source="NOAA Research Database"
            snippet="Historical data analysis shows correlation with temperature..."
            score={0.88}
          />
          <EvidenceCard
            source="IPCC Report 2023"
            snippet="Climate models predict continued patterns based on..."
            score={0.85}
          />
        </TabsContent>

        <TabsContent value="provenance" className="mt-2 animate-fade-in">
          <ProvenanceGraphPlaceholder />
        </TabsContent>

        <TabsContent value="explainability" className="mt-2 animate-fade-in">
          <ExplainabilityTabs hasOCR={claimData?.hasOCR} hasVideo={claimData?.hasVideo} />
        </TabsContent>

        <TabsContent value="media" className="mt-2 animate-fade-in">
          {!claimData?.hasMedia ? (
            <Card className="p-10 text-center space-y-4 animate-fade-in">
              <ImageIcon className="h-14 w-14 mx-auto text-muted-foreground/50" />
              <h4 className="font-semibold text-foreground">No Media Content</h4>
              <p className="text-sm text-muted-foreground">
                This claim does not contain any image, video, or audio content to display.
              </p>
            </Card>
          ) : (
            <MediaViewer hasVideo={claimData.hasVideo} hasAudio={claimData.hasAudio} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
