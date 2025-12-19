"use client"

import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Lightbulb, ScanText } from "lucide-react"

interface ExplainabilityTabsProps {
  hasOCR?: boolean
  hasVideo?: boolean
}

export function ExplainabilityTabs({ hasOCR, hasVideo }: ExplainabilityTabsProps) {
  return (
    <div className="space-y-4">
      {hasOCR && hasVideo ? (
        <Tabs defaultValue="highlights" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="highlights" className="gap-2">
              <Lightbulb className="h-4 w-4" />
              Highlights
            </TabsTrigger>
            <TabsTrigger value="ocr" className="gap-2">
              <ScanText className="h-4 w-4" />
              OCR
            </TabsTrigger>
          </TabsList>

          <TabsContent value="highlights" className="space-y-4">
            <Card className="p-6 space-y-4 transition-all duration-300 hover:shadow-lg animate-fade-in">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                <h4 className="font-semibold text-card-foreground">Text Highlights</h4>
              </div>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  AI analysis highlights key phrases and context:{" "}
                  <span className="bg-chart-4/20 text-chart-4 px-1 rounded transition-all duration-300 hover:bg-chart-4/30">
                    climate change
                  </span>{" "}
                  and{" "}
                  <span className="bg-chart-4/20 text-chart-4 px-1 rounded transition-all duration-300 hover:bg-chart-4/30">
                    hurricane activity
                  </span>{" "}
                  show strong correlation in verified sources.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Contradictory claims found in{" "}
                  <span className="bg-destructive/20 text-destructive px-1 rounded transition-all duration-300 hover:bg-destructive/30">
                    unverified sources
                  </span>{" "}
                  with low credibility scores.
                </p>
              </div>
            </Card>

            <Card
              className="p-6 space-y-4 transition-all duration-300 hover:shadow-lg animate-fade-in"
              style={{ animationDelay: "0.1s" }}
            >
              <h4 className="font-semibold text-card-foreground">Image Analysis Heatmap</h4>
              <div className="aspect-video bg-muted/30 rounded-lg overflow-hidden flex items-center justify-center transition-all duration-300 hover:shadow-inner">
                <div className="text-center space-y-2 p-6">
                  <div className="h-12 w-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                    <Lightbulb className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">Visual attention heatmap placeholder</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="ocr" className="space-y-4">
            <Card className="p-6 space-y-4 transition-all duration-300 hover:shadow-lg animate-fade-in">
              <div className="flex items-center gap-2">
                <ScanText className="h-5 w-5 text-primary" />
                <h4 className="font-semibold text-card-foreground">OCR Text Extraction</h4>
              </div>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Text extracted from video frames contains:{" "}
                  <span className="bg-chart-4/20 text-chart-4 px-1 rounded transition-all duration-300 hover:bg-chart-4/30">
                    "Great Wall of China"
                  </span>{" "}
                  and{" "}
                  <span className="bg-chart-4/20 text-chart-4 px-1 rounded transition-all duration-300 hover:bg-chart-4/30">
                    "visible from space"
                  </span>
                </p>
                <div className="bg-muted/30 rounded-lg p-4 border border-border">
                  <p className="text-sm font-mono text-muted-foreground">
                    Frame 00:15 - "The Great Wall is the only man-made structure visible from space"
                    <br />
                    Frame 00:32 - "NASA astronauts confirm low-Earth orbit visibility"
                    <br />
                    Frame 00:47 - "Width varies: 4.5m to 9m in different sections"
                  </p>
                </div>
              </div>
            </Card>

            <Card
              className="p-6 space-y-4 transition-all duration-300 hover:shadow-lg animate-fade-in"
              style={{ animationDelay: "0.1s" }}
            >
              <h4 className="font-semibold text-card-foreground">OCR Confidence Scores</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Frame 00:15</span>
                  <span className="text-foreground font-medium">98.5%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Frame 00:32</span>
                  <span className="text-foreground font-medium">95.2%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Frame 00:47</span>
                  <span className="text-foreground font-medium">97.8%</span>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <>
          <Card className="p-6 space-y-4 transition-all duration-300 hover:shadow-lg animate-fade-in">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              <h4 className="font-semibold text-card-foreground">Text Highlights</h4>
            </div>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                AI analysis highlights key phrases and context:{" "}
                <span className="bg-chart-4/20 text-chart-4 px-1 rounded transition-all duration-300 hover:bg-chart-4/30">
                  climate change
                </span>{" "}
                and{" "}
                <span className="bg-chart-4/20 text-chart-4 px-1 rounded transition-all duration-300 hover:bg-chart-4/30">
                  hurricane activity
                </span>{" "}
                show strong correlation in verified sources.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Contradictory claims found in{" "}
                <span className="bg-destructive/20 text-destructive px-1 rounded transition-all duration-300 hover:bg-destructive/30">
                  unverified sources
                </span>{" "}
                with low credibility scores.
              </p>
            </div>
          </Card>

          <Card
            className="p-6 space-y-4 transition-all duration-300 hover:shadow-lg animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            <h4 className="font-semibold text-card-foreground">Image Analysis Heatmap</h4>
            <div className="aspect-video bg-muted/30 rounded-lg overflow-hidden flex items-center justify-center transition-all duration-300 hover:shadow-inner">
              <div className="text-center space-y-2 p-6">
                <div className="h-12 w-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                  <Lightbulb className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">Visual attention heatmap placeholder</p>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
