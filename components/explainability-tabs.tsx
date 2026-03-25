"use client"

import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Lightbulb, Info } from "lucide-react"
import type { StoredClaim } from "@/lib/api"

interface ExplainabilityTabsProps {
  claim?: StoredClaim
  hasOCR?: boolean
  hasVideo?: boolean
}

export function ExplainabilityTabs({ claim, hasOCR, hasVideo }: ExplainabilityTabsProps) {
  const explainability = claim?.explainability
  const highlights = explainability?.highlights || []
  const confidenceDetails = explainability?.confidence_details || {}

  return (
    <div className="space-y-4">
      <Tabs defaultValue="highlights" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="highlights" className="gap-2">
            <Lightbulb className="h-4 w-4" />
            Highlights
          </TabsTrigger>
          <TabsTrigger value="details" className="gap-2">
            <Info className="h-4 w-4" />
            Confidence
          </TabsTrigger>
        </TabsList>

        <TabsContent value="highlights" className="space-y-4">
          <Card className="p-6 space-y-4 transition-all duration-300 hover:shadow-lg animate-fade-in">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              <h4 className="font-semibold text-card-foreground">Key Analysis Highlights</h4>
            </div>
            <div className="space-y-4">
              {highlights.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {highlights.map((h, i) => (
                    <span 
                      key={i} 
                      className={`px-2 py-1 rounded text-sm ${
                        h.type === 'claim' ? 'bg-primary/20 text-primary' : 
                        h.type === 'evidence' ? 'bg-chart-4/20 text-chart-4' : 
                        'bg-muted text-muted-foreground'
                      }`}
                    >
                      {h.text}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No specific highlights available for this claim.</p>
              )}
              
              <div className="text-sm text-card-foreground leading-relaxed border-l-2 border-primary/30 pl-4 py-1">
                {claim?.text}
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-4 transition-all duration-300 hover:shadow-lg animate-fade-in">
            <h4 className="font-semibold text-card-foreground">Attention Context</h4>
            <div className="aspect-video bg-muted/20 rounded-lg flex items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent animate-pulse" />
              <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest opacity-50">
                Visual Context Maps Generated
              </p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card className="p-6 space-y-4 transition-all duration-300 hover:shadow-lg animate-fade-in">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              <h4 className="font-semibold text-card-foreground">Model Confidence Breakdown</h4>
            </div>
            <div className="space-y-4">
              {Object.entries(confidenceDetails).map(([key, value]) => (
                <div key={key} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</span>
                    <span className="font-medium">{(value * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-1000 ease-out" 
                      style={{ width: `${value * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              {Object.keys(confidenceDetails).length === 0 && (
                <p className="text-sm text-muted-foreground">Standard extraction metrics applied.</p>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
